import { Task } from '@/types/task';
import { statusLabels as phaseLabels } from '@/types/project';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Loader2,
  Play,
  ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientProjectSummaryProps {
  tasks: Task[];
  isLoading?: boolean;
}

const phases = ['discovery', 'design', 'development', 'review', 'published'] as const;

interface PhaseStatus {
  phase: string;
  label: string;
  total: number;
  completed: number;
  inProgress: number;
  status: 'not_started' | 'in_progress' | 'complete';
}

function getPhaseStatus(tasks: Task[]): PhaseStatus['status'] {
  if (tasks.length === 0) return 'not_started';
  const completed = tasks.filter(t => t.status === 'completed').length;
  if (completed === tasks.length) return 'complete';
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  if (inProgress > 0 || completed > 0) return 'in_progress';
  return 'not_started';
}

function PhaseCard({ phase }: { phase: PhaseStatus }) {
  const statusConfig = {
    not_started: { 
      icon: Circle, 
      color: 'text-muted-foreground', 
      bg: 'bg-muted',
      label: 'Not Started'
    },
    in_progress: { 
      icon: Play, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      label: 'In Progress'
    },
    complete: { 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      label: 'Complete'
    },
  };

  const config = statusConfig[phase.status];
  const Icon = config.icon;
  const progress = phase.total > 0 ? Math.round((phase.completed / phase.total) * 100) : 0;

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors",
      phase.status === 'complete' && "bg-emerald-500/5 border-emerald-500/20",
      phase.status === 'in_progress' && "bg-blue-500/5 border-blue-500/20",
      phase.status === 'not_started' && "bg-muted/30"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{phase.label}</h4>
        <div className={cn("p-1 rounded-full", config.bg)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{config.label}</span>
        <span>{phase.completed}/{phase.total} tasks</span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}

export function ClientProjectSummary({ tasks, isLoading }: ClientProjectSummaryProps) {
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

  // Calculate overall progress
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const overallProgress = Math.round((totalCompleted / tasks.length) * 100);

  // Calculate phase statuses
  const phaseStatuses: PhaseStatus[] = phases.map(phase => {
    const phaseTasks = tasks.filter(t => t.phase === phase);
    const completed = phaseTasks.filter(t => t.status === 'completed').length;
    const inProgress = phaseTasks.filter(t => t.status === 'in_progress').length;
    
    return {
      phase,
      label: phaseLabels[phase],
      total: phaseTasks.length,
      completed,
      inProgress,
      status: getPhaseStatus(phaseTasks),
    };
  }).filter(p => p.total > 0); // Only show phases with tasks

  // Find current phase
  const currentPhase = phaseStatuses.find(p => p.status === 'in_progress') 
    || phaseStatuses.find(p => p.status === 'not_started');

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm font-medium">Overall Progress</span>
            {currentPhase && (
              <span className="ml-2 text-xs text-muted-foreground">
                • Currently in {currentPhase.label}
              </span>
            )}
          </div>
          <span className="text-2xl font-bold">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          {totalCompleted} of {tasks.length} tasks complete
        </p>
      </div>

      {/* Phase Progress Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {phaseStatuses.map(phase => (
          <PhaseCard key={phase.phase} phase={phase} />
        ))}
      </div>
    </div>
  );
}
