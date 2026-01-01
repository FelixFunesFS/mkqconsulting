export type ActivityType =
  | 'document_uploaded'
  | 'document_deleted'
  | 'task_created'
  | 'task_completed'
  | 'task_status_changed'
  | 'questionnaire_updated'
  | 'project_status_changed'
  | 'note_added';

export interface Activity {
  id: string;
  projectId: string;
  userId: string | null;
  activityType: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  visibleToClient: boolean;
  createdAt: string;
  // Joined from profiles
  userName?: string;
  userEmail?: string;
}

export const activityTypeConfig: Record<ActivityType, { icon: string; color: string; label: string }> = {
  document_uploaded: { icon: 'FileUp', color: 'text-blue-500', label: 'Document Uploaded' },
  document_deleted: { icon: 'FileX', color: 'text-red-500', label: 'Document Deleted' },
  task_created: { icon: 'ListPlus', color: 'text-green-500', label: 'Task Created' },
  task_completed: { icon: 'CheckCircle', color: 'text-emerald-500', label: 'Task Completed' },
  task_status_changed: { icon: 'RefreshCw', color: 'text-amber-500', label: 'Task Updated' },
  questionnaire_updated: { icon: 'FileEdit', color: 'text-purple-500', label: 'Questionnaire Updated' },
  project_status_changed: { icon: 'FolderKanban', color: 'text-indigo-500', label: 'Project Status Changed' },
  note_added: { icon: 'StickyNote', color: 'text-yellow-500', label: 'Note Added' },
};
