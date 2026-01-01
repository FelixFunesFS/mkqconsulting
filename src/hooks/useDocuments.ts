import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectDocument, DocumentCategory } from '@/types/document';
import { useToast } from '@/hooks/use-toast';
import { logActivity } from './useActivities';

interface DbDocument {
  id: string;
  project_id: string;
  uploaded_by: string;
  name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  category: string;
  description: string | null;
  visible_to_client: boolean;
  created_at: string;
  updated_at: string;
}

const mapDbToDocument = (row: DbDocument): ProjectDocument => ({
  id: row.id,
  projectId: row.project_id,
  uploadedBy: row.uploaded_by,
  name: row.name,
  filePath: row.file_path,
  fileSize: row.file_size,
  mimeType: row.mime_type,
  category: row.category as DocumentCategory,
  description: row.description,
  visibleToClient: row.visible_to_client,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function useDocuments(projectId: string) {
  return useQuery({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('category')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as DbDocument[]).map(mapDbToDocument);
    },
    enabled: !!projectId,
  });
}

interface UploadDocumentParams {
  projectId: string;
  file: File;
  category: DocumentCategory;
  description?: string;
  visibleToClient?: boolean;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, file, category, description, visibleToClient = true }: UploadDocumentParams) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${projectId}/${category}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const { data, error } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          uploaded_by: user.id,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          category,
          description,
          visible_to_client: visibleToClient,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToDocument(data as DbDocument);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.projectId] });
      toast({ title: 'Document uploaded successfully' });
      
      // Log activity
      logActivity({
        projectId: variables.projectId,
        activityType: 'document_uploaded',
        title: `Uploaded: ${data.name}`,
        metadata: { documentId: data.id, category: data.category },
      });
    },
    onError: (error) => {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    },
  });
}

interface UpdateDocumentParams {
  id: string;
  projectId: string;
  name?: string;
  description?: string;
  visibleToClient?: boolean;
  category?: DocumentCategory;
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name, description, visibleToClient, category }: UpdateDocumentParams) => {
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (visibleToClient !== undefined) updates.visible_to_client = visibleToClient;
      if (category !== undefined) updates.category = category;

      const { error } = await supabase
        .from('project_documents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.projectId] });
      toast({ title: 'Document updated' });
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, filePath, projectId, fileName }: { id: string; filePath: string; projectId: string; fileName?: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete database record
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { projectId, fileName };
    },
    onSuccess: ({ projectId, fileName }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      toast({ title: 'Document deleted' });
      
      // Log activity
      logActivity({
        projectId,
        activityType: 'document_deleted',
        title: `Deleted: ${fileName || 'document'}`,
      });
    },
    onError: (error) => {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDocumentDownloadUrl(filePath: string) {
  return useQuery({
    queryKey: ['document-url', filePath],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('project-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!filePath,
    staleTime: 1000 * 60 * 55, // Cache for 55 minutes
  });
}
