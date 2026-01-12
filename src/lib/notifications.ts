import { supabase } from "@/integrations/supabase/client";

interface NotificationParams {
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

export async function sendNotification(params: NotificationParams): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("send-notification", {
      body: params,
    });

    if (error) {
      console.error("Failed to send notification:", error);
    }
  } catch (err) {
    // Silently fail - notifications are non-critical
    console.error("Notification error:", err);
  }
}

// Helper to get client email for a project
export async function getClientEmailForProject(projectId: string): Promise<{ email: string; projectName: string } | null> {
  try {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("business_name, client_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project?.client_id) return null;

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("email")
      .eq("id", project.client_id)
      .single();

    if (clientError || !client) return null;

    return { email: client.email, projectName: project.business_name };
  } catch {
    return null;
  }
}
