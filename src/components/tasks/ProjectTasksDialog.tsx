import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskList } from './TaskList';
import { Project } from '@/types/project';
import { useTasks, useUpdateTaskStatus, useDeleteTask, useGenerateTasks } from '@/hooks/useTasks';
import { useQuestionnaire } from '@/hooks/useQuestionnaires';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { TaskStatus } from '@/types/task';

interface ProjectTasksDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectTasksDialog({ project, open, onOpenChange }: ProjectTasksDialogProps) {
  const { data: tasks = [], isLoading: isLoadingTasks } = useTasks(project?.id);
  const { data: questionnaire } = useQuestionnaire(project?.id);
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const generateTasks = useGenerateTasks();

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
    
    try {
      const result = await generateTasks.mutateAsync({
        projectId: project.id,
        questionnaire: questionnaire || {},
        projectName: project.businessName,
        currentPhase: project.status,
      });
      
      toast({
        title: 'Tasks Generated',
        description: `Successfully generated ${result.count} tasks for ${project.businessName}.`,
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate tasks',
        variant: 'destructive',
      });
    }
  };

  return (
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
              onDelete={handleDelete}
              onGenerateTasks={handleGenerateTasks}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}