import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientTask, ClientTaskTemplate } from '@/types/clientTask';
import { useRealtimeSubscription } from './useRealtimeSubscription';

// Map database row to ClientTask
function mapDbToClientTask(row: any): ClientTask {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    completedAt: row.completed_at,
    completedBy: row.completed_by,
    clientNotes: row.client_notes,
    adminNotes: row.admin_notes,
    whyNeeded: row.why_needed,
    dueDate: row.due_date,
    displayOrder: row.display_order,
    source: row.source,
    visibleToClient: row.visible_to_client,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDbToClientTaskTemplate(row: any): ClientTaskTemplate {
  return {
    id: row.id,
    templateSet: row.template_set,
    name: row.name,
    description: row.description,
    category: row.category,
    priority: row.priority,
    whyNeeded: row.why_needed,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// Fetch client tasks for a project
export function useClientTasks(projectId: string | undefined) {
  useRealtimeSubscription({
    table: 'client_tasks',
    projectId,
    queryKey: ['client_tasks', projectId],
  });

  return useQuery({
    queryKey: ['client_tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbToClientTask);
    },
    enabled: !!projectId,
  });
}

// Fetch all template sets
export function useClientTaskTemplateSets() {
  return useQuery({
    queryKey: ['client_task_template_sets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_task_templates')
        .select('template_set')
        .eq('is_active', true);

      if (error) throw error;
      const sets = [...new Set((data || []).map(t => t.template_set))];
      return sets;
    },
  });
}

// Fetch templates by set
export function useClientTaskTemplates(templateSet?: string) {
  return useQuery({
    queryKey: ['client_task_templates', templateSet],
    queryFn: async () => {
      let query = supabase
        .from('client_task_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (templateSet) {
        query = query.eq('template_set', templateSet);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapDbToClientTaskTemplate);
    },
  });
}

// Create client task
export function useCreateClientTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<ClientTask> & { projectId: string }) => {
      const { data, error } = await supabase
        .from('client_tasks')
        .insert({
          project_id: task.projectId,
          title: task.title,
          description: task.description,
          category: task.category || 'other',
          priority: task.priority || 'medium',
          status: task.status || 'pending',
          client_notes: task.clientNotes,
          admin_notes: task.adminNotes,
          why_needed: task.whyNeeded,
          due_date: task.dueDate,
          display_order: task.displayOrder || 0,
          source: task.source || 'manual',
          visible_to_client: task.visibleToClient ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToClientTask(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client_tasks', variables.projectId] });
    },
  });
}

// Update client task
export function useUpdateClientTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, ...updates }: Partial<ClientTask> & { id: string; projectId: string }) => {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
      if (updates.completedBy !== undefined) dbUpdates.completed_by = updates.completedBy;
      if (updates.clientNotes !== undefined) dbUpdates.client_notes = updates.clientNotes;
      if (updates.adminNotes !== undefined) dbUpdates.admin_notes = updates.adminNotes;
      if (updates.whyNeeded !== undefined) dbUpdates.why_needed = updates.whyNeeded;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;
      if (updates.visibleToClient !== undefined) dbUpdates.visible_to_client = updates.visibleToClient;

      const { data, error } = await supabase
        .from('client_tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToClientTask(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client_tasks', variables.projectId] });
    },
  });
}

// Delete client task
export function useDeleteClientTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('client_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client_tasks', variables.projectId] });
    },
  });
}

// Apply template set to a project
export function useApplyClientTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, templateSet }: { projectId: string; templateSet: string }) => {
      // Fetch templates
      const { data: templates, error: fetchError } = await supabase
        .from('client_task_templates')
        .select('*')
        .eq('template_set', templateSet)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      if (!templates?.length) throw new Error('No templates found');

      // Create tasks from templates
      const tasksToInsert = templates.map(t => ({
        project_id: projectId,
        title: t.name,
        description: t.description,
        category: t.category,
        priority: t.priority,
        why_needed: t.why_needed,
        display_order: t.display_order,
        source: 'template',
        visible_to_client: true,
      }));

      const { data, error } = await supabase
        .from('client_tasks')
        .insert(tasksToInsert)
        .select();

      if (error) throw error;
      return (data || []).map(mapDbToClientTask);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client_tasks', variables.projectId] });
    },
  });
}
