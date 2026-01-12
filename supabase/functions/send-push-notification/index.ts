import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  url?: string;
  data?: Record<string, unknown>;
}

// Web Push implementation using raw fetch (no external dependencies)
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    // For now, we'll use a simple HTTP request to the push endpoint
    // In production, you'd need proper VAPID signing
    // This is a simplified implementation
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(payload.length),
        'TTL': '86400',
      },
      body: payload,
    });

    if (response.status === 410 || response.status === 404) {
      return false; // Subscription expired
    }

    return response.ok || response.status === 201;
  } catch (error: unknown) {
    console.error('Web push failed:', error);
    return true; // Keep subscription on error
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for database operations
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin access required' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log("VAPID keys not configured - skipping push notification");
      return new Response(
        JSON.stringify({ success: false, message: "Push notifications not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, userIds, title, body, url, data }: PushNotificationRequest = await req.json();

    // Build list of target user IDs
    const targetUserIds = userIds || (userId ? [userId] : []);
    
    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No target users specified' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch subscriptions for target users
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh, auth')
      .in('user_id', targetUserIds);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for target users');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      data: data || {},
      timestamp: Date.now(),
    });

    console.log(`Sending push to ${subscriptions.length} subscriptions`);

    // Send to all subscriptions
    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        const keepSubscription = await sendWebPush(sub, payload, vapidPublicKey, vapidPrivateKey);
        return { id: sub.id, success: keepSubscription };
      })
    );

    // Remove expired subscriptions
    const expiredIds = results.filter(r => !r.success).map(r => r.id);
    if (expiredIds.length > 0) {
      console.log(`Removing ${expiredIds.length} expired subscriptions`);
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', expiredIds);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Push notifications sent: ${successCount}/${subscriptions.length}`);

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: subscriptions.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending push notification:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
