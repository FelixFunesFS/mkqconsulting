export type DocumentCategory = 
  | 'formation'
  | 'tax'
  | 'branding'
  | 'contracts'
  | 'compliance'
  | 'client_uploads'
  | 'other';

export interface ProjectDocument {
  id: string;
  projectId: string;
  uploadedBy: string;
  name: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  category: DocumentCategory;
  description: string | null;
  visibleToClient: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  formation: 'Formation Documents',
  tax: 'Tax Documents',
  branding: 'Branding Assets',
  contracts: 'Contracts',
  compliance: 'Compliance',
  client_uploads: 'Client Uploads',
  other: 'Other',
};

export const ADMIN_CATEGORIES: DocumentCategory[] = [
  'formation',
  'tax',
  'branding',
  'contracts',
  'compliance',
  'other',
];

export const CLIENT_UPLOAD_CATEGORY: DocumentCategory = 'client_uploads';
