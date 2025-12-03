import { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { statusLabels as phaseLabels } from '@/types/project';
import { Plus, Sparkles, Loader2, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskTemplates, useApplyTemplates } from '@/hooks/useTaskTemplates';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: Task[];
  projectId: string;
  projectPhase: string;
  isGenerating?: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onGenerateTasks?: () => void;
  onAddTask?: () => void;
}

const phases = ['discovery', 'design', 'development', 'review', 'published'] as const;

export function TaskList({
  tasks,
  projectId,
  projectPhase,
  isGenerating,
  onStatusChange,
  onEdit,
  onDelete,
  onGenerateTasks,
  onAddTask,
}: TaskListProps) {
  const [activePhase, setActivePhase] = useState<string>(projectPhase);
  const { data: templates } = useTaskTemplates();
  const applyTemplates = useApplyTemplates();

  const tasksByPhase = phases.reduce((acc, phase) => {
    acc[phase] = tasks.filter((t) => t.phase === phase);
    return acc;
  }, {} as Record<string, Task[]>);

  const getPhaseStats = (phase: string) => {
    const phaseTasks = tasksByPhase[phase] || [];
    const completed = phaseTasks.filter((t) => t.status === 'completed').length;
    return { total: phaseTasks.length, completed };
  };

  const handleApplyChecklist = () => {
    if (!templates || templates.length === 0) {
      toast.error('No templates available');
      return;
    }

    applyTemplates.mutate(
      { projectId, templates },
      {
        onSuccess: (result) => {
          if (result.added > 0) {
            toast.success(`Added ${result.added} pre-launch checklist items`);
            // Switch to review tab to show the new tasks
            setActivePhase('review');
          } else {
            toast.info('All checklist items already exist');
          }
          if (result.skipped > 0 && result.added > 0) {
            toast.info(`${result.skipped} items were already present`);
          }
        },
        onError: () => {
          toast.error('Failed to apply checklist');
        },
      }
    );
  };

  if (tasks.length === 0 && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-2">No Tasks Yet</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-md">
          Generate tasks automatically using AI based on the project questionnaire, or add tasks manually.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {onGenerateTasks && (
            <Button onClick={onGenerateTasks} disabled={isGenerating}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          )}
          {onAddTask && (
            <Button variant="outline" onClick={onAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleApplyChecklist}
            disabled={applyTemplates.isPending}
          >
            {applyTemplates.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4 mr-2" />
            )}
            Pre-Launch Checklist
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {onGenerateTasks && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGenerateTasks}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Regenerate Tasks'}
            </Button>
          )}
          {onAddTask && (
            <Button variant="outline" size="sm" onClick={onAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyChecklist}
            disabled={applyTemplates.isPending}
          >
            {applyTemplates.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4 mr-2" />
            )}
            Pre-Launch Checklist
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {tasks.filter((t) => t.status === 'completed').length} of {tasks.length} completed
        </p>
      </div>

      <Tabs value={activePhase} onValueChange={setActivePhase}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {phases.map((phase) => {
            const stats = getPhaseStats(phase);
            return (
              <TabsTrigger
                key={phase}
                value={phase}
                className={cn(
                  'relative',
                  phase === projectPhase && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
              >
                {phaseLabels[phase]}
                {stats.total > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {stats.completed}/{stats.total}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {phases.map((phase) => (
          <TabsContent key={phase} value={phase} className="mt-4">
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tasksByPhase[phase]?.length > 0 ? (
              <div className="space-y-2">
                {tasksByPhase[phase].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tasks in this phase
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
