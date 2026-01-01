export type ClientTaskCategory = 
  | 'access'
  | 'approvals'
  | 'content'
  | 'assets'
  | 'messaging'
  | 'incentives'
  | 'seo'
  | 'other';

export type ClientTaskStatus = 'pending' | 'completed' | 'not_applicable';

export type ClientTaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ClientTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  category: ClientTaskCategory;
  priority: ClientTaskPriority;
  status: ClientTaskStatus;
  completedAt: string | null;
  completedBy: string | null;
  clientNotes: string | null;
  adminNotes: string | null;
  whyNeeded: string | null;
  dueDate: string | null;
  displayOrder: number;
  source: string;
  visibleToClient: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientTaskTemplate {
  id: string;
  templateSet: string;
  name: string;
  description: string | null;
  category: ClientTaskCategory;
  priority: ClientTaskPriority;
  whyNeeded: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export const CATEGORY_LABELS: Record<ClientTaskCategory, string> = {
  access: 'Priority Access',
  approvals: 'Approvals',
  content: 'Content',
  assets: 'Assets',
  messaging: 'Messaging',
  incentives: 'Incentives',
  seo: 'Local SEO',
  other: 'Other',
};

export const CATEGORY_ORDER: ClientTaskCategory[] = [
  'access',
  'approvals',
  'seo',
  'messaging',
  'content',
  'assets',
  'incentives',
  'other',
];

export const PRIORITY_CONFIG: Record<ClientTaskPriority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'text-red-600 bg-red-100' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-100' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  low: { label: 'Low', color: 'text-green-600 bg-green-100' },
};

export const STATUS_CONFIG: Record<ClientTaskStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-muted-foreground' },
  completed: { label: 'Completed', color: 'text-green-600' },
  not_applicable: { label: 'N/A', color: 'text-muted-foreground' },
};
