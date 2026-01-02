import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TaskPriority } from '@/types/task';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  phase: string;
  priority: TaskPriority;
  estimatedHours: number | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

const mapDbToTemplate = (row: any): TaskTemplate => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  phase: row.phase,
  priority: row.priority as TaskPriority,
  estimatedHours: row.estimated_hours ? Number(row.estimated_hours) : null,
  isActive: row.is_active,
  displayOrder: row.display_order,
  createdAt: row.created_at,
});

export function useTaskTemplates() {
  return useQuery({
    queryKey: ['task-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data.map(mapDbToTemplate);
    },
  });
}

export function useApplyTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, templates }: { projectId: string; templates: TaskTemplate[] }) => {
      // Get existing tasks for this project to avoid duplicates
      const { data: existingTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('title')
        .eq('project_id', projectId);

      if (fetchError) throw fetchError;

      const existingTitles = new Set(existingTasks?.map((t) => t.title.toLowerCase()) || []);

      // Filter out templates that already exist
      const newTemplates = templates.filter(
        (t) => !existingTitles.has(t.name.toLowerCase())
      );

      if (newTemplates.length === 0) {
        return { added: 0, skipped: templates.length };
      }

      // Insert new tasks from templates
      const tasksToInsert = newTemplates.map((template) => ({
        project_id: projectId,
        title: template.name,
        description: template.description,
        phase: template.phase,
        priority: template.priority,
        status: 'pending' as const,
        source: 'template' as const,
        estimated_hours: template.estimatedHours,
      }));

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (insertError) throw insertError;

      // Note: Project stats (total_tasks, tasks_completed, progress) are now
      // automatically updated by the update_project_task_stats database trigger

      return { added: newTemplates.length, skipped: templates.length - newTemplates.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Group templates by category for display
export function groupTemplatesByCategory(templates: TaskTemplate[]) {
  return templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, TaskTemplate[]>);
}

export const categoryLabels: Record<string, string> = {
  technical: 'Technical',
  seo: 'SEO',
  accessibility: 'Accessibility',
  performance: 'Performance',
  links: 'Links & Content',
  forms: 'Forms & Functionality',
  legal: 'Legal & Compliance',
  analytics: 'Analytics & Tracking',
};
