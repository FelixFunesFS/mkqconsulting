import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { logActivity } from './useActivities';

// Map database row to Task type
const mapDbToTask = (row: any): Task => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  description: row.description,
  phase: row.phase,
  priority: row.priority as TaskPriority,
  status: row.status as TaskStatus,
  estimatedHours: row.estimated_hours,
  dueDate: row.due_date,
  assignedTo: row.assigned_to,
  source: row.source,
  questionnaireField: row.questionnaire_field,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Fetch tasks for a project
export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('phase', { ascending: true })
        .order('priority', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbToTask);
    },
    enabled: !!projectId,
  });
}

// Update task status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return mapDbToTask(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Log activity
      const activityType = data.status === 'completed' ? 'task_completed' : 'task_status_changed';
      const title = data.status === 'completed' 
        ? `Completed: ${data.title}`
        : `Task "${data.title}" moved to ${data.status.replace('_', ' ')}`;
      logActivity({
        projectId: data.projectId,
        activityType,
        title,
        metadata: { taskId: data.id, status: data.status },
      });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      updates 
    }: { 
      taskId: string; 
      updates: Partial<{
        title: string;
        description: string;
        phase: string;
        priority: TaskPriority;
        status: TaskStatus;
        estimated_hours: number;
        due_date: string;
        assigned_to: string;
      }>;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return mapDbToTask(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      project_id: string;
      title: string;
      description?: string;
      phase: string;
      priority?: TaskPriority;
      status?: TaskStatus;
      estimated_hours?: number;
      due_date?: string;
      assigned_to?: string;
      source?: 'manual' | 'ai_generated' | 'template';
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          source: task.source || 'manual',
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToTask(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Log activity
      logActivity({
        projectId: data.projectId,
        activityType: 'task_created',
        title: `New task: ${data.title}`,
        metadata: { taskId: data.id, phase: data.phase },
      });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, projectId }: { taskId: string; projectId: string }) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { taskId, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Generate tasks using AI
export function useGenerateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      questionnaire,
      projectName,
      currentPhase,
      mode = 'regenerate',
      customPrompt,
    }: {
      projectId: string;
      questionnaire: any;
      projectName: string;
      currentPhase: string;
      mode?: 'regenerate' | 'add_new';
      customPrompt?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-tasks', {
        body: { projectId, questionnaire, projectName, currentPhase, mode, customPrompt },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}