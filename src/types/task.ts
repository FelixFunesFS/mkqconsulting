export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskSource = 'ai_generated' | 'manual' | 'template';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  phase: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number | null;
  dueDate: string | null;
  assignedTo: string | null;
  source: TaskSource;
  questionnaireField: string | null;
  createdAt: string;
  updatedAt: string;
}

export const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  blocked: 'bg-red-500/20 text-red-400',
};

export const statusLabels: Record<TaskStatus, string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  completed: 'Done',
  blocked: 'Blocked',
};

export const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};