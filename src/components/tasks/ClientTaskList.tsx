import { Task } from '@/types/task';
import { statusLabels as phaseLabels } from '@/types/project';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Loader2,
  ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientTaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  maxHeight?: string;
}

const statusConfig = {
  pending: { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Pending' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Completed' },
  blocked: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Blocked' },
};

const phases = ['discovery', 'design', 'development', 'review', 'published'] as const;

function TaskItem({ task }: { task: Task }) {
  const config = statusConfig[task.status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
      task.status === 'completed' && "bg-muted/30"
    )}>
      <div className={cn("p-1 rounded-full mt-0.5", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          task.status === 'completed' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        {config.label}
      </Badge>
    </div>
  );
}

function PhaseSection({ phase, tasks }: { phase: string; tasks: Task[] }) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{phaseLabels[phase]}</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {completed}/{tasks.length}
          </span>
          <Progress value={progress} className="w-16 h-1.5" />
        </div>
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export function ClientTaskList({ tasks, isLoading, maxHeight = '500px' }: ClientTaskListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ListTodo className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm font-medium">No tasks yet</p>
        <p className="text-xs">Tasks will appear here once the project begins</p>
      </div>
    );
  }

  // Group tasks by phase
  const tasksByPhase = phases.reduce((acc, phase) => {
    const phaseTasks = tasks.filter(t => t.phase === phase);
    if (phaseTasks.length > 0) {
      acc[phase] = phaseTasks;
    }
    return acc;
  }, {} as Record<string, Task[]>);

  // Calculate overall progress
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const overallProgress = Math.round((totalCompleted / tasks.length) * 100);

  return (
    <div className="space-y-4">
      {/* Overall progress summary */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {totalCompleted} of {tasks.length} tasks
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{overallProgress}% complete</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <Circle className="h-3 w-3" /> {tasks.filter(t => t.status === 'pending').length} pending
            </span>
            <span className="flex items-center gap-1 text-blue-500">
              <Clock className="h-3 w-3" /> {tasks.filter(t => t.status === 'in_progress').length} in progress
            </span>
          </div>
        </div>
      </div>

      {/* Tasks by phase */}
      <ScrollArea style={{ maxHeight }} className="pr-4">
        <div className="space-y-6">
          {phases.map(phase => {
            const phaseTasks = tasksByPhase[phase];
            if (!phaseTasks) return null;
            return <PhaseSection key={phase} phase={phase} tasks={phaseTasks} />;
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
