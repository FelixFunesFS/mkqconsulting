import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Fetch client tasks for this project
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const tasksByCategory = (tasks || []).reduce((acc, task) => {
      const category = task.category || "other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);

    // Build task list HTML
    let taskListHtml = "";
    for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
      taskListHtml += `
        <h3 style="color: #374151; margin: 20px 0 10px 0; font-size: 16px;">
          ${categoryLabels[category] || category}
        </h3>
        <ul style="margin: 0; padding-left: 20px;">
      `;
      for (const task of categoryTasks as any[]) {
        taskListHtml += `
          <li style="margin: 8px 0; color: #4b5563;">
            <strong>${task.title}</strong>
            ${task.why_needed ? `<br><span style="font-size: 13px; color: #6b7280;">${task.why_needed}</span>` : ""}
          </li>
        `;
      }
      taskListHtml += "</ul>";
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Your Project Portal</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Hi ${clientName},</p>
            
            <p>We're excited to get started on <strong>${projectName}</strong>! To help us build the best possible website for your business, we need a few things from you.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📋 Your Task Checklist</h2>
              ${taskListHtml || "<p>No tasks assigned yet.</p>"}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${portalUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Access Your Portal
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              You can complete these tasks at your convenience through your client portal. We'll keep you updated on progress as we work together.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              Questions? Just reply to this email and we'll help you out.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MKQ Marketing <onboarding@resend.dev>",
        to: [clientEmail],
        subject: `Welcome to ${projectName} - Your Task Checklist`,
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
