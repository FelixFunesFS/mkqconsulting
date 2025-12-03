import { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { statusLabels as phaseLabels } from '@/types/project';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  projectPhase: string;
  isGenerating?: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onGenerateTasks?: () => void;
  onAddTask?: () => void;
}

const phases = ['discovery', 'design', 'development', 'review', 'published'] as const;

export function TaskList({
  tasks,
  projectPhase,
  isGenerating,
  onStatusChange,
  onDelete,
  onGenerateTasks,
  onAddTask,
}: TaskListProps) {
  const [activePhase, setActivePhase] = useState<string>(projectPhase);

  const tasksByPhase = phases.reduce((acc, phase) => {
    acc[phase] = tasks.filter((t) => t.phase === phase);
    return acc;
  }, {} as Record<string, Task[]>);

  const getPhaseStats = (phase: string) => {
    const phaseTasks = tasksByPhase[phase] || [];
    const completed = phaseTasks.filter((t) => t.status === 'completed').length;
    return { total: phaseTasks.length, completed };
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
        <div className="flex gap-3">
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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