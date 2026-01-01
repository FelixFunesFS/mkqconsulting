import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TaskList } from './TaskList';
import { TaskEditDialog } from './TaskEditDialog';
import { TaskCreateDialog } from './TaskCreateDialog';
import { ActivityTimeline } from '@/components/activities/ActivityTimeline';
import { AddNoteDialog } from '@/components/activities/AddNoteDialog';
import { Project } from '@/types/project';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useTasks, useUpdateTaskStatus, useUpdateTask, useDeleteTask, useGenerateTasks, useCreateTask } from '@/hooks/useTasks';
import { useQuestionnaire } from '@/hooks/useQuestionnaires';
import { toast } from '@/hooks/use-toast';
import { Loader2, ListTodo, History, Plus } from 'lucide-react';

interface ProjectTasksDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectTasksDialog({ project, open, onOpenChange }: ProjectTasksDialogProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);

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
              {project?.businessName}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="tasks" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" /> Tasks
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <History className="h-4 w-4" /> Activity
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="flex-1 overflow-y-auto pr-2 mt-4">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  projectId={project?.id || ''}
                  projectPhase={project?.status || 'discovery'}
                  isGenerating={generateTasks.isPending}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onGenerateTasks={handleGenerateTasks}
                  onAddTask={handleAddTask}
                />
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="flex-1 overflow-hidden mt-4">
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddNoteDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Note
                </Button>
              </div>
              {project && (
                <ActivityTimeline 
                  projectId={project.id} 
                  isAdmin={true} 
                  maxHeight="calc(85vh - 220px)" 
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <TaskEditDialog
        task={editingTask}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveEdit}
      />

      {project && (
        <>
          <TaskCreateDialog
            projectId={project.id}
            currentPhase={project.status}
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSave={handleCreateTask}
          />
          <AddNoteDialog
            projectId={project.id}
            open={showAddNoteDialog}
            onOpenChange={setShowAddNoteDialog}
          />
        </>
      )}
    </>
  );
}
