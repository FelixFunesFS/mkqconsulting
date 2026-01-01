import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClientTaskChecklist } from './ClientTaskChecklist';
import { ApplyTemplateDialog } from './ApplyTemplateDialog';
import { ClientTask } from '@/types/clientTask';
import { useClientTasks, useUpdateClientTask, useDeleteClientTask } from '@/hooks/useClientTasks';
import { toast } from '@/hooks/use-toast';
import { Plus, FileStack, Loader2 } from 'lucide-react';

interface AdminClientTaskListProps {
  projectId: string;
}

export function AdminClientTaskList({ projectId }: AdminClientTaskListProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const { data: tasks = [], isLoading } = useClientTasks(projectId);
  const updateTask = useUpdateClientTask();
  const deleteTask = useDeleteClientTask();

  const handleStatusChange = async (
    taskId: string,
    status: 'pending' | 'completed' | 'not_applicable'
  ) => {
    try {
      const completedAt = status === 'completed' ? new Date().toISOString() : null;
      await updateTask.mutateAsync({
        id: taskId,
        projectId,
        status,
        completedAt,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const handleNotesChange = async (taskId: string, notes: string) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        projectId,
        clientNotes: notes,
      });
      toast({
        title: 'Notes Saved',
        description: 'Client notes have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (task: ClientTask) => {
    // TODO: Open edit dialog
    console.log('Edit task:', task);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync({ id: taskId, projectId });
      toast({
        title: 'Task Deleted',
        description: 'The client task has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplateDialog(true)}
        >
          <FileStack className="h-4 w-4 mr-2" />
          Apply Template
        </Button>
        {/* TODO: Add "Create Task" button */}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-4">
            No client tasks yet. Apply a template to get started.
          </p>
          <Button onClick={() => setShowTemplateDialog(true)}>
            <FileStack className="h-4 w-4 mr-2" />
            Apply Template
          </Button>
        </div>
      ) : (
        <ClientTaskChecklist
          tasks={tasks}
          isAdmin={true}
          maxHeight="calc(85vh - 350px)"
          onStatusChange={handleStatusChange}
          onNotesChange={handleNotesChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ApplyTemplateDialog
        projectId={projectId}
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      />
    </div>
  );
}
