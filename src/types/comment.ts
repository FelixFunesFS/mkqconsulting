export interface Comment {
  id: string;
  projectId: string;
  taskId: string | null;
  userId: string;
  content: string;
  visibleToClient: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined from profiles
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}
