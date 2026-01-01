import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity, ActivityType } from '@/types/activity';

const mapDbToActivity = (row: any): Activity => ({
  id: row.id,
  projectId: row.project_id,
  userId: row.user_id,
  activityType: row.activity_type as ActivityType,
  title: row.title,
  description: row.description,
  metadata: row.metadata || {},
  visibleToClient: row.visible_to_client,
  createdAt: row.created_at,
  userName: row.profiles?.full_name,
  userEmail: row.profiles?.email,
});

export function useActivities(projectId: string | undefined) {
  return useQuery({
    queryKey: ['activities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapDbToActivity);
    },
    enabled: !!projectId,
  });
}

interface CreateActivityParams {
  projectId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  visibleToClient?: boolean;
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      activityType,
      title,
      description,
      metadata = {},
      visibleToClient = true,
    }: CreateActivityParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('activities')
        .insert({
          project_id: projectId,
          user_id: user?.id || null,
          activity_type: activityType,
          title,
          description,
          metadata,
          visible_to_client: visibleToClient,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToActivity(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.projectId] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
    },
  });
}

export function useUpdateActivityVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, visibleToClient }: { id: string; projectId: string; visibleToClient: boolean }) => {
      const { error } = await supabase
        .from('activities')
        .update({ visible_to_client: visibleToClient })
        .eq('id', id);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
    },
  });
}

// Helper to log activity from other hooks
export async function logActivity(params: CreateActivityParams) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('activities')
    .insert({
      project_id: params.projectId,
      user_id: user?.id || null,
      activity_type: params.activityType,
      title: params.title,
      description: params.description,
      metadata: params.metadata || {},
      visible_to_client: params.visibleToClient ?? true,
    });

  if (error) console.error('Failed to log activity:', error);
}
