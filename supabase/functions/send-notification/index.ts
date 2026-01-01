import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured - skipping email notification");
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "Email notifications not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, projectId, projectName, clientEmail, details }: NotificationRequest = await req.json();

    if (!clientEmail) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "No client email provided" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "project_status_changed":
        subject = `Project Update: ${projectName} moved to ${details.newStatus}`;
        htmlContent = `
          <h2>Project Status Update</h2>
          <p>Your project <strong>${projectName}</strong> has been updated.</p>
          <p>Status changed from <strong>${details.previousStatus}</strong> to <strong>${details.newStatus}</strong>.</p>
          <p>Log in to your client portal to view more details.</p>
        `;
        break;

      case "comment_added":
        subject = `New Comment on ${projectName}`;
        htmlContent = `
          <h2>New Comment</h2>
          <p><strong>${details.commentAuthor}</strong> added a comment on your project <strong>${projectName}</strong>:</p>
          <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; margin: 16px 0;">
            ${details.commentPreview}
          </blockquote>
          <p>Log in to your client portal to view and reply.</p>
        `;
        break;

      case "document_uploaded":
        subject = `New Document Uploaded to ${projectName}`;
        htmlContent = `
          <h2>New Document Available</h2>
          <p>A new document has been uploaded to your project <strong>${projectName}</strong>:</p>
          <p><strong>${details.documentName}</strong></p>
          <p>Uploaded by: ${details.uploaderName}</p>
          <p>Log in to your client portal to download the document.</p>
        `;
        break;
    }

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
        html: htmlContent,
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
