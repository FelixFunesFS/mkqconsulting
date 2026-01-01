import { Task } from '@/types/task';
import { statusLabels as phaseLabels } from '@/types/project';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Loader2,
  Play,
  ListTodo,
  Sparkles,
  Palette,
  Code2,
  Eye,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientProjectSummaryProps {
  tasks: Task[];
  isLoading?: boolean;
}

const phases = ['discovery', 'design', 'development', 'review', 'published'] as const;

// Friendly descriptions for each phase
const phaseDescriptions: Record<string, { active: string; complete: string; icon: typeof Sparkles }> = {
  discovery: {
    active: "We're learning about your business and goals",
    complete: "Discovery complete - we understand your vision",
    icon: Sparkles,
  },
  design: {
    active: "Creating your visual mockups and layouts",
    complete: "Design approved and ready to build",
    icon: Palette,
  },
  development: {
    active: "Building your website with care",
    complete: "Development complete - site is built",
    icon: Code2,
  },
  review: {
    active: "Final review and quality checks",
    complete: "All checks passed - ready to launch",
    icon: Eye,
  },
  published: {
    active: "Preparing for launch",
    complete: "Your site is live!",
    icon: Rocket,
  },
};

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

function PhaseTimelineItem({ phase, isLast, isCurrent }: { phase: PhaseStatus; isLast: boolean; isCurrent: boolean }) {
  const description = phaseDescriptions[phase.phase];
  const Icon = description?.icon || Circle;
  
  const statusConfig = {
    not_started: { 
      dotColor: 'bg-muted-foreground/30', 
      lineColor: 'bg-muted-foreground/20',
      textColor: 'text-muted-foreground',
    },
    in_progress: { 
      dotColor: 'bg-primary', 
      lineColor: 'bg-primary/30',
      textColor: 'text-foreground',
    },
    complete: { 
      dotColor: 'bg-emerald-500', 
      lineColor: 'bg-emerald-500/50',
      textColor: 'text-emerald-700 dark:text-emerald-400',
    },
  };

  const config = statusConfig[phase.status];
  const progress = phase.total > 0 ? Math.round((phase.completed / phase.total) * 100) : 0;

  return (
    <div className="flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
          phase.status === 'complete' && "bg-emerald-500/10",
          phase.status === 'in_progress' && "bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background",
          phase.status === 'not_started' && "bg-muted"
        )}>
          {phase.status === 'complete' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : phase.status === 'in_progress' ? (
            <Play className="h-4 w-4 text-primary fill-primary" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        {!isLast && (
          <div className={cn("w-0.5 flex-1 my-2 min-h-[24px]", config.lineColor)} />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn("font-medium", config.textColor)}>{phase.label}</h4>
          <Icon className={cn("h-4 w-4", config.textColor)} />
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">
          {phase.status === 'complete' 
            ? description?.complete 
            : phase.status === 'in_progress' 
              ? description?.active 
              : `Coming up next`}
        </p>

        {/* Show progress only for in_progress phase */}
        {phase.status === 'in_progress' && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{phase.completed} of {phase.total} tasks</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Compact info for completed phases */}
        {phase.status === 'complete' && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            ✓ {phase.total} tasks completed
          </span>
        )}
      </div>
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
  }).filter(p => p.total > 0);

  // Find current phase
  const currentPhaseIndex = phaseStatuses.findIndex(p => p.status === 'in_progress');
  const currentPhase = currentPhaseIndex >= 0 ? phaseStatuses[currentPhaseIndex] : null;

  // Get friendly status message
  const getStatusMessage = () => {
    if (overallProgress === 100) return "Your project is complete! 🎉";
    if (currentPhase) return phaseDescriptions[currentPhase.phase]?.active || "Work in progress";
    return "Getting started";
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <div className={cn(
        "p-5 rounded-xl border transition-all",
        overallProgress === 100 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-gradient-to-br from-primary/5 to-transparent border-primary/10"
      )}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{getStatusMessage()}</h3>
            {currentPhase && (
              <p className="text-sm text-muted-foreground mt-1">
                Currently in the {currentPhase.label.toLowerCase()} phase
              </p>
            )}
          </div>
          <div className={cn(
            "text-3xl font-bold",
            overallProgress === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
          )}>
            {overallProgress}%
          </div>
        </div>
        <Progress 
          value={overallProgress} 
          className={cn(
            "h-2",
            overallProgress === 100 && "[&>div]:bg-emerald-500"
          )} 
        />
        <p className="text-xs text-muted-foreground mt-2">
          {totalCompleted} of {tasks.length} tasks complete
        </p>
      </div>

      {/* Phase Timeline */}
      <div className="px-2">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Project Timeline</h4>
        <div>
          {phaseStatuses.map((phase, index) => (
            <PhaseTimelineItem 
              key={phase.phase} 
              phase={phase}
              isLast={index === phaseStatuses.length - 1}
              isCurrent={phase.status === 'in_progress'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
