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
  type: "project_status_changed" | "comment_added" | "document_uploaded";
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
  };
}

// Also send push notification if available
async function sendPushNotification(
  supabase: any,
  projectId: string,
  title: string,
  body: string,
  url: string
) {
  try {
    // Get client user ID from project
    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', projectId)
      .single();

    if (!project?.client_id) return;

    // Get user_id from client
    const { data: client } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', project.client_id)
      .single();

    if (!client?.user_id) return;

    // Get push subscriptions for this user
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', client.user_id);

    if (!subscriptions || subscriptions.length === 0) return;

    const payload = JSON.stringify({ title, body, url, timestamp: Date.now() });

    for (const sub of subscriptions) {
      try {
        // Simple push to endpoint (browser handles display)
        await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'TTL': '86400',
          },
          body: payload,
        });
      } catch (err) {
        console.log('Push failed for subscription:', err);
      }
    }
  } catch (err) {
    console.log('Push notification error (non-critical):', err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, projectId, projectName, clientEmail, details }: NotificationRequest = await req.json();

    // Portal URL for links
    const portalUrl = `https://www.mkqconsulting.com/portal`;
    const projectUrl = `${portalUrl}/project/${projectId}`;

    // Send push notification for all types
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
    }

    // Send push notification (fire and forget)
    sendPushNotification(supabase, projectId, pushTitle, pushBody, projectUrl);

    // Handle email notification
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured - skipping email notification");
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
              <tr>
                <td align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 8px 16px;">
                        ${statusBadge(details.previousStatus || 'unknown')}
                      </td>
                      <td style="padding: 8px 16px; font-size: 24px; color: ${brandColors.gray};">
                        →
                      </td>
                      <td style="padding: 8px 16px;">
                        ${statusBadge(details.newStatus || 'unknown')}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            ${infoBox(`Your project is now in the <strong>${details.newStatus}</strong> phase. Log in to your portal to see what's happening next.`, '🎯')}
            
            ${emailButton('View Project Details', projectUrl)}
            
            ${divider()}
            
            ${paragraph(`<span style="color: ${brandColors.gray}; font-size: 14px;">We'll keep you updated as your project progresses through each phase.</span>`)}
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
            
            ${divider()}
            
            ${paragraph(`<span style="color: ${brandColors.gray}; font-size: 14px;">Reply directly from your client portal to keep the conversation going.</span>`)}
          `)}
        `;
        break;

      case "document_uploaded":
        subject = `New Document Uploaded to ${projectName}`;
        emailContent = `
          ${emailHeader("New Document Available", projectName)}
          ${emailCard(`
            ${paragraph(`A new document has been uploaded to your project:`)}
            
            ${infoBox(`
              <strong style="font-size: 16px;">📄 ${details.documentName}</strong><br>
              <span style="color: ${brandColors.gray};">Uploaded by ${details.uploaderName}</span>
            `, '📎')}
            
            ${emailButton('View Document', projectUrl)}
            
            ${divider()}
            
            ${paragraph(`<span style="color: ${brandColors.gray}; font-size: 14px;">All your project documents are securely stored in your client portal.</span>`)}
          `)}
        `;
        break;
    }

    const emailHtml = emailWrapper(emailContent, pushBody);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MKQ Consulting <envision@mkqconsulting.com>",
        to: [clientEmail],
        subject,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({ success: false, error: data }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending notification:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
