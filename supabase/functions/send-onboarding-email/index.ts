import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  emailWrapper,
  emailHeader,
  emailCard,
  emailButton,
  infoBox,
  sectionHeading,
  paragraph,
  divider,
  brandColors,
} from "../_shared/email-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingEmailRequest {
  projectId: string;
  clientEmail: string;
  clientName: string;
  projectName: string;
  portalUrl: string;
}

const categoryIcons: Record<string, string> = {
  access: "🔑",
  approvals: "✅",
  content: "📝",
  assets: "🖼️",
  messaging: "💬",
  incentives: "🎁",
  seo: "📍",
  other: "📋",
};

const categoryLabels: Record<string, string> = {
  access: "Priority Access",
  approvals: "Approvals",
  content: "Content",
  assets: "Assets",
  messaging: "Messaging",
  incentives: "Incentives",
  seo: "Local SEO",
  other: "Other",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing authorization' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role client for all operations including user verification
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract and verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.error('JWT verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log('Authenticated user:', userId);

    // Check if user has admin role

    // Check if user has admin role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error checking user role:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roles || roles.length === 0) {
      console.error('User does not have admin role:', userId);
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin access required' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin role verified for user:', userId);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - email would be sent to:", await req.json());
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email service not configured. Please add RESEND_API_KEY." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { projectId, clientEmail, clientName, projectName, portalUrl }: OnboardingEmailRequest = await req.json();

    const { data: tasks, error: tasksError } = await supabase
      .from("client_tasks")
      .select("title, category, priority, why_needed")
      .eq("project_id", projectId)
      .eq("visible_to_client", true)
      .eq("status", "pending")
      .order("display_order", { ascending: true });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw new Error("Failed to fetch client tasks");
    }

    // Group tasks by category for email
    const tasksByCategory = (tasks || []).reduce((acc, task) => {
      const category = task.category || "other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);

    // Build task list HTML
    let taskListHtml = "";
    for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
      const icon = categoryIcons[category] || "📋";
      const label = categoryLabels[category] || category;
      
      taskListHtml += `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
          <tr>
            <td>
              <h3 style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; color: ${brandColors.darkGray};">
                ${icon} ${label}
              </h3>
            </td>
          </tr>
      `;
      
      for (const task of categoryTasks as any[]) {
        taskListHtml += `
          <tr>
            <td style="padding: 8px 0 8px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width: 8px; vertical-align: top; padding-top: 6px;">
                    <div style="width: 6px; height: 6px; background-color: ${brandColors.info}; border-radius: 50%;"></div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 500; color: ${brandColors.darkGray};">
                      ${task.title}
                    </p>
                    ${task.why_needed ? `
                    <p style="margin: 4px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: ${brandColors.gray};">
                      ${task.why_needed}
                    </p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      }
      taskListHtml += "</table>";
    }

    // Build the full email
    const emailContent = `
      ${emailHeader("Welcome to Your Project Portal", `Let's build something amazing for ${projectName}`)}
      ${emailCard(`
        ${paragraph(`Hi <strong>${clientName}</strong>,`)}
        ${paragraph(`We're thrilled to get started on <strong>${projectName}</strong>! To help us build the perfect website for your business, we've prepared a personalized task checklist for you.`)}
        
        ${infoBox(`
          <strong>What's Next?</strong><br>
          Complete the tasks below at your convenience. Each task helps us understand your vision and gather the materials we need to create something exceptional.
        `, '🚀')}
        
        ${sectionHeading('📋 Your Task Checklist')}
        
        ${taskListHtml || paragraph('No tasks assigned yet. Check back soon!')}
        
        ${emailButton('Access Your Portal', portalUrl)}
        
        ${divider()}
        
        ${paragraph(`<span style="color: ${brandColors.gray}; font-size: 14px;">You can complete these tasks at your own pace through your client portal. We'll notify you of progress updates as we work together to bring your vision to life.</span>`)}
      `)}
    `;

    const emailHtml = emailWrapper(
      emailContent, 
      `Your project ${projectName} is ready! Complete your onboarding tasks to get started.`
    );

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MKQ Consulting <envision@mkqconsulting.com>",
        to: [clientEmail],
        subject: `Welcome to ${projectName} — Your Task Checklist`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);
      throw new Error(resendData.message || "Failed to send email");
    }

    console.log("Onboarding email sent successfully:", resendData);

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-onboarding-email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
