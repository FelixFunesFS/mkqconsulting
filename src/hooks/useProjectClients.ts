import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectClient {
  id: string;
  projectId: string;
  clientId: string;
  createdAt: string;
}

function mapRow(row: any): ProjectClient {
  return {
    id: row.id,
    projectId: row.project_id,
    clientId: row.client_id,
    createdAt: row.created_at,
  };
}

/** Get all client IDs assigned to a project */
export function useProjectClients(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project-clients', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_clients')
        .select('*')
        .eq('project_id', projectId);
      if (error) throw error;
      return data.map(mapRow);
    },
    enabled: !!projectId,
  });
}

/** Get all project IDs assigned to a client */
export function useClientProjects(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client-projects', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('project_clients')
        .select('*')
        .eq('client_id', clientId);
      if (error) throw error;
      return data.map(mapRow);
    },
    enabled: !!clientId,
  });
}

/** Atomically replace all client assignments for a project */
export function useSyncProjectClients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, clientIds }: { projectId: string; clientIds: string[] }) => {
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from('project_clients')
        .delete()
        .eq('project_id', projectId);
      if (deleteError) throw deleteError;

      // Insert new assignments
      if (clientIds.length > 0) {
        const rows = clientIds.map((clientId) => ({
          project_id: projectId,
          client_id: clientId,
        }));
        const { error: insertError } = await supabase
          .from('project_clients')
          .insert(rows);
        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-clients', projectId] });
      queryClient.invalidateQueries({ queryKey: ['client-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAddProjectClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, clientId }: { projectId: string; clientId: string }) => {
      const { error } = await supabase
        .from('project_clients')
        .insert({ project_id: projectId, client_id: clientId });
      if (error) throw error;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-clients', projectId] });
      queryClient.invalidateQueries({ queryKey: ['client-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRemoveProjectClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, clientId }: { projectId: string; clientId: string }) => {
      const { error } = await supabase
        .from('project_clients')
        .delete()
        .eq('project_id', projectId)
        .eq('client_id', clientId);
      if (error) throw error;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-clients', projectId] });
      queryClient.invalidateQueries({ queryKey: ['client-projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
