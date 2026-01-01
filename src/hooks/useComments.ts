import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/comment';
import { logActivity } from './useActivities';

const mapDbToComment = (row: any): Comment => ({
  id: row.id,
  projectId: row.project_id,
  taskId: row.task_id,
  userId: row.user_id,
  content: row.content,
  visibleToClient: row.visible_to_client,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  userName: row.profiles?.full_name,
  userEmail: row.profiles?.email,
  userAvatar: row.profiles?.avatar_url,
});

export function useComments(projectId: string | undefined, taskId?: string | null) {
  return useQuery({
    queryKey: ['comments', projectId, taskId],
    queryFn: async () => {
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (full_name, email, avatar_url)
        `)
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });

      if (taskId) {
        query = query.eq('task_id', taskId);
      } else {
        query = query.is('task_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(mapDbToComment);
    },
    enabled: !!projectId,
  });
}

interface CreateCommentParams {
  projectId: string;
  taskId?: string | null;
  content: string;
  visibleToClient?: boolean;
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, taskId, content, visibleToClient = true }: CreateCommentParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          task_id: taskId || null,
          user_id: user.id,
          content,
          visible_to_client: visibleToClient,
        })
        .select(`
          *,
          profiles:user_id (full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      return mapDbToComment(data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.projectId, variables.taskId] });
      
      // Log activity for project-level comments only
      if (!variables.taskId) {
        logActivity({
          projectId: variables.projectId,
          activityType: 'note_added',
          title: 'New comment added',
          description: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
          visibleToClient: variables.visibleToClient,
        });
      }
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      projectId, 
      taskId,
      content, 
      visibleToClient 
    }: { 
      id: string; 
      projectId: string; 
      taskId?: string | null;
      content?: string; 
      visibleToClient?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (content !== undefined) updates.content = content;
      if (visibleToClient !== undefined) updates.visible_to_client = visibleToClient;

      const { error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { projectId, taskId };
    },
    onSuccess: ({ projectId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId, taskId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, taskId }: { id: string; projectId: string; taskId?: string | null }) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { projectId, taskId };
    },
    onSuccess: ({ projectId, taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId, taskId] });
    },
  });
}
