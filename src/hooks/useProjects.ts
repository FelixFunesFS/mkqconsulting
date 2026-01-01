import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus } from '@/types/project';
import { logActivity } from './useActivities';

// Map database row to Project type
const mapDbToProject = (row: any): Project => ({
  id: row.id,
  clientName: row.client_name,
  businessName: row.business_name,
  websiteUrl: row.website_url,
  status: row.status as ProjectStatus,
  progress: row.progress,
  tasksCompleted: row.tasks_completed,
  totalTasks: row.total_tasks,
  startDate: row.start_date,
  targetLaunchDate: row.target_launch_date,
  monthlyRevenue: row.monthly_revenue ? Number(row.monthly_revenue) : undefined,
  hostingProvider: row.hosting_provider,
  notes: row.notes,
  displayOrder: row.display_order,
  clientId: row.client_id,
});

// Map Project to database insert/update
const mapProjectToDb = (project: Partial<Project>) => ({
  client_name: project.clientName,
  business_name: project.businessName,
  website_url: project.websiteUrl,
  status: project.status,
  progress: project.progress,
  tasks_completed: project.tasksCompleted,
  total_tasks: project.totalTasks,
  start_date: project.startDate,
  target_launch_date: project.targetLaunchDate,
  monthly_revenue: project.monthlyRevenue,
  hosting_provider: project.hostingProvider,
  notes: project.notes,
  display_order: project.displayOrder,
  client_id: project.clientId,
});

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapDbToProject);
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(mapProjectToDb(project))
        .select()
        .single();

      if (error) throw error;
      return mapDbToProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...project }: Partial<Project> & { id: string }) => {
      // Get current status before update
      const { data: current } = await supabase
        .from('projects')
        .select('status')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('projects')
        .update(mapProjectToDb(project))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { project: mapDbToProject(data), previousStatus: current?.status };
    },
    onSuccess: ({ project, previousStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Log activity if status changed
      if (project.status && previousStatus && project.status !== previousStatus) {
        logActivity({
          projectId: project.id,
          activityType: 'project_status_changed',
          title: `Project moved to ${project.status.replace('_', ' ')}`,
          metadata: { previousStatus, newStatus: project.status },
        });
      }
    },
  });
}

export function useUpdateProjectOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orders: { id: string; displayOrder: number }[]) => {
      // Update each project's display_order
      const updates = orders.map(({ id, displayOrder }) =>
        supabase
          .from('projects')
          .update({ display_order: displayOrder })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
