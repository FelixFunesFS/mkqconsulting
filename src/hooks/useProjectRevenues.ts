import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type RevenueType = 'monthly' | 'one_time';
export type RevenueStatus = 'active' | 'pending' | 'paused' | 'cancelled';

export interface ProjectRevenue {
  id: string;
  project_id: string;
  type: RevenueType;
  amount: number;
  description: string | null;
  start_date: string | null;
  is_active: boolean;
  status: RevenueStatus;
  created_at: string;
}

export function useProjectRevenues(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project-revenues', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_revenues')
        .select('*')
        .eq('project_id', projectId)
        .order('type', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ProjectRevenue[];
    },
    enabled: !!projectId,
  });
}

export function useAddRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (revenue: {
      project_id: string;
      type: RevenueType;
      amount: number;
      description?: string;
      start_date?: string;
      is_active?: boolean;
      status?: RevenueStatus;
    }) => {
      const { data, error } = await supabase
        .from('project_revenues')
        .insert({
          project_id: revenue.project_id,
          type: revenue.type,
          amount: revenue.amount,
          description: revenue.description || null,
          start_date: revenue.start_date || null,
          is_active: revenue.is_active ?? true,
          status: revenue.status ?? 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-revenues', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      project_id,
      ...updates
    }: {
      id: string;
      project_id: string;
      type?: RevenueType;
      amount?: number;
      description?: string | null;
      start_date?: string | null;
      is_active?: boolean;
      status?: RevenueStatus;
    }) => {
      const { data, error } = await supabase
        .from('project_revenues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-revenues', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteRevenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      const { error } = await supabase
        .from('project_revenues')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-revenues', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Hook to get revenue totals for all projects at once
export function useAllProjectRevenues() {
  return useQuery({
    queryKey: ['all-project-revenues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_revenues')
        .select('*');

      if (error) throw error;
      return data as ProjectRevenue[];
    },
  });
}
