import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'activities' | 'comments' | 'tasks' | 'client_tasks';

interface UseRealtimeSubscriptionOptions {
  table: TableName;
  projectId: string | undefined;
  queryKey: (string | undefined | null)[];
  filter?: string;
}

export function useRealtimeSubscription({
  table,
  projectId,
  queryKey,
  filter,
}: UseRealtimeSubscriptionOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const channelName = `${table}-${projectId}-${queryKey.join('-')}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter || `project_id=eq.${projectId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`Realtime ${table} update:`, payload.eventType);
          // Invalidate the query to refetch data
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, table, queryClient, filter, JSON.stringify(queryKey)]);
}

// Hook for subscribing to project-related realtime updates
export function useProjectRealtimeUpdates(projectId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Subscribe to activities
    const activitiesChannel = supabase
      .channel(`activities-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
        }
      )
      .subscribe();
    channels.push(activitiesChannel);

    // Subscribe to comments
    const commentsChannel = supabase
      .channel(`comments-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Invalidate all comment queries for this project
          queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
        }
      )
      .subscribe();
    channels.push(commentsChannel);

    // Subscribe to tasks
    const tasksChannel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
      )
      .subscribe();
    channels.push(tasksChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [projectId, queryClient]);
}
