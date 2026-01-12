import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  emailWrapper,
  emailHeader,
  emailCard,
  emailButton,
  statusBadge,
  quoteBlock,
  infoBox,
  paragraph,
  divider,
  brandColors,
} from "../_shared/email-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "project_status_changed" | "comment_added" | "document_uploaded" | "client_task_assigned";
  projectId: string;
  projectName: string;
  clientEmail?: string;
  details: {
    previousStatus?: string;
    newStatus?: string;
    commentPreview?: string;
    commentAuthor?: string;
    documentName?: string;
    uploaderName?: string;
    taskTitle?: string;
    taskCount?: number;
  };
}

// Send push notification using Web Push protocol
async function sendPushNotification(
  supabaseClient: any,
  projectId: string,
  title: string,
  body: string,
  url: string
) {
  try {
    // Get client user ID from project
    const { data: project } = await supabaseClient
      .from("projects")
      .select("client_id")
      .eq("id", projectId)
      .single();

    if (!project?.client_id) return;

    // Get user_id from client
    const { data: client } = await supabaseClient
      .from("clients")
      .select("user_id")
      .eq("id", project.client_id)
      .single();

    if (!client?.user_id) return;

    // Get push subscriptions for this user
    const { data: subscriptions } = await supabaseClient
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", client.user_id);

    if (!subscriptions || subscriptions.length === 0) return;

    const payload = JSON.stringify({ title, body, url, timestamp: Date.now() });

    console.log(`Sending push to ${subscriptions.length} subscriptions`);

    const expiredIds: string[] = [];

    for (const sub of subscriptions) {
      try {
        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "TTL": "86400",
          },
          body: payload,
        });

        if (response.status === 410 || response.status === 404) {
          expiredIds.push(sub.id);
        } else {
          console.log("Push sent to:", sub.endpoint.substring(0, 50));
        }
      } catch (err) {
        console.log("Push failed for subscription:", err);
      }
    }

    if (expiredIds.length > 0) {
      await supabaseClient.from("push_subscriptions").delete().in("id", expiredIds);
    }
  } catch (err) {
    console.log("Push notification error (non-critical):", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[send-notification] Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to verify the user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      console.log("[send-notification] Invalid user token:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log("[send-notification] Authenticated user:", userId);

    // Use service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has admin role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");

    if (rolesError || !roles || roles.length === 0) {
      console.log("[send-notification] User is not admin:", userId);
      return new Response(
        JSON.stringify({ error: "Forbidden - admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[send-notification] Admin access verified for user:", userId);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const { type, projectId, projectName, clientEmail, details }: NotificationRequest = await req.json();

    const portalUrl = `https://www.mkqconsulting.com/portal`;
    const projectUrl = `${portalUrl}/project/${projectId}`;

    let pushTitle = "";
    let pushBody = "";

    switch (type) {
      case "project_status_changed":
        pushTitle = "Project Update";
        pushBody = `${projectName} moved to ${details.newStatus}`;
        break;
      case "comment_added":
        pushTitle = `New comment from ${details.commentAuthor}`;
        pushBody = details.commentPreview || "View the comment in your portal";
        break;
      case "document_uploaded":
        pushTitle = "New Document Available";
        pushBody = `${details.documentName} uploaded to ${projectName}`;
        break;
      case "client_task_assigned":
        if (details.taskCount && details.taskCount > 1) {
          pushTitle = "New Tasks Assigned";
          pushBody = `${details.taskCount} new tasks added to ${projectName}`;
        } else {
          pushTitle = "New Task Assigned";
          pushBody = details.taskTitle || "A new task needs your attention";
        }
        break;
    }

    await sendPushNotification(supabase, projectId, pushTitle, pushBody, projectUrl);

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "Email notifications not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!clientEmail) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "No client email provided" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let emailContent = "";

    switch (type) {
      case "project_status_changed":
        subject = `Project Update: ${projectName} moved to ${details.newStatus}`;
        emailContent = `
          ${emailHeader("Project Status Update", projectName)}
          ${emailCard(`
            ${paragraph(`Great news! Your project has progressed to a new phase.`)}
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
              <tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="padding: 8px 16px;">${statusBadge(details.previousStatus || 'unknown')}</td>
                <td style="padding: 8px 16px; font-size: 24px; color: ${brandColors.gray};">→</td>
                <td style="padding: 8px 16px;">${statusBadge(details.newStatus || 'unknown')}</td>
              </tr></table></td></tr>
            </table>
            ${infoBox(`Your project is now in the <strong>${details.newStatus}</strong> phase.`, '🎯')}
            ${emailButton('View Project Details', projectUrl)}
            ${divider()}
            ${paragraph(`<span style="color: ${brandColors.gray}; font-size: 14px;">We'll keep you updated as your project progresses.</span>`)}
          `)}
        `;
        break;
      case "comment_added":
        subject = `New Comment on ${projectName}`;
        emailContent = `
          ${emailHeader("New Comment", projectName)}
          ${emailCard(`
            ${paragraph(`<strong>${details.commentAuthor}</strong> added a new comment on your project:`)}
            ${quoteBlock(details.commentPreview || '', details.commentAuthor)}
            ${emailButton('View & Reply', projectUrl)}
          `)}
        `;
        break;
      case "document_uploaded":
        subject = `New Document Uploaded to ${projectName}`;
        emailContent = `
          ${emailHeader("New Document Available", projectName)}
          ${emailCard(`
            ${paragraph(`A new document has been uploaded to your project:`)}
            ${infoBox(`<strong>📄 ${details.documentName}</strong><br><span style="color: ${brandColors.gray};">Uploaded by ${details.uploaderName}</span>`, '📎')}
            ${emailButton('View Document', projectUrl)}
          `)}
        `;
        break;
      case "client_task_assigned":
        if (details.taskCount && details.taskCount > 1) {
          subject = `${details.taskCount} New Tasks for ${projectName}`;
          emailContent = `
            ${emailHeader("New Tasks Assigned", projectName)}
            ${emailCard(`
              ${paragraph(`Your action items have been updated!`)}
              ${infoBox(`<strong>${details.taskCount} new tasks</strong> have been added to your project checklist.`, '📋')}
              ${paragraph(`These tasks need your attention to keep your project moving forward.`)}
              ${emailButton('View Your Tasks', projectUrl)}
            `)}
          `;
        } else {
          subject = `New Task: ${details.taskTitle}`;
          emailContent = `
            ${emailHeader("New Task Assigned", projectName)}
            ${emailCard(`
              ${paragraph(`A new task has been added to your project checklist:`)}
              ${infoBox(`<strong>✅ ${details.taskTitle}</strong>`, '📋')}
              ${paragraph(`This task needs your attention to keep your project moving forward.`)}
              ${emailButton('View Task Details', projectUrl)}
            `)}
          `;
        }
        break;
    }

    const emailHtml = emailWrapper(emailContent, pushBody);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "MKQ Consulting <envision@mkqconsulting.com>",
        to: [clientEmail],
        subject,
        html: emailHtml,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, error: data }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
