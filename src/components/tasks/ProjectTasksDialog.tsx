import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskList } from './TaskList';
import { TaskEditDialog } from './TaskEditDialog';
import { TaskCreateDialog } from './TaskCreateDialog';
import { Project } from '@/types/project';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useTasks, useUpdateTaskStatus, useUpdateTask, useDeleteTask, useGenerateTasks, useCreateTask } from '@/hooks/useTasks';
import { useQuestionnaire } from '@/hooks/useQuestionnaires';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProjectTasksDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectTasksDialog({ project, open, onOpenChange }: ProjectTasksDialogProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: tasks = [], isLoading: isLoadingTasks } = useTasks(project?.id);
  const { data: questionnaire } = useQuestionnaire(project?.id);
  const updateStatus = useUpdateTaskStatus();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const generateTasks = useGenerateTasks();
  const createTask = useCreateTask();

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateStatus.mutateAsync({ taskId, status });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async (taskId: string, updates: Partial<{
    title: string;
    description: string;
    phase: string;
    priority: TaskPriority;
    status: TaskStatus;
    estimated_hours: number;
    due_date: string;
    assigned_to: string;
  }>) => {
    try {
      await updateTask.mutateAsync({ taskId, updates });
      toast({
        title: 'Task Updated',
        description: 'The task has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!project) return;
    try {
      await deleteTask.mutateAsync({ taskId, projectId: project.id });
      toast({
        title: 'Task Deleted',
        description: 'The task has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateTasks = async () => {
    if (!project) return;
    
    // Check if there are completed tasks
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const hasCompletedTasks = completedTasks.length > 0;
    
    try {
      const result = await generateTasks.mutateAsync({
        projectId: project.id,
        questionnaire: questionnaire || {},
        projectName: project.businessName,
        currentPhase: project.status,
        mode: 'regenerate', // Preserves completed tasks
      });
      
      toast({
        title: 'Tasks Generated',
        description: hasCompletedTasks 
          ? `Generated ${result.count} new tasks. ${completedTasks.length} completed tasks preserved.`
          : `Successfully generated ${result.count} tasks for ${project.businessName}.`,
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate tasks',
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = () => {
    setShowCreateDialog(true);
  };

  const handleCreateTask = async (task: {
    project_id: string;
    title: string;
    description?: string;
    phase: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    estimated_hours?: number;
    due_date?: string;
    assigned_to?: string;
    source: 'manual';
  }) => {
    try {
      await createTask.mutateAsync(task);
      toast({
        title: 'Task Created',
        description: 'New task has been added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">
              Tasks: {project?.businessName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {isLoadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                projectPhase={project?.status || 'discovery'}
                isGenerating={generateTasks.isPending}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGenerateTasks={handleGenerateTasks}
                onAddTask={handleAddTask}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TaskEditDialog
        task={editingTask}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveEdit}
      />

      {project && (
        <TaskCreateDialog
          projectId={project.id}
          currentPhase={project.status}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSave={handleCreateTask}
        />
      )}
    </>
  );
}
