import { useState, useMemo } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getActivePhases, WEB_DEV_PHASES, DOMAIN_LABELS, groupPhasesByDomain } from '@/types/phases';
import { Plus, Sparkles, Loader2, ClipboardCheck, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskTemplates, useApplyTemplates } from '@/hooks/useTaskTemplates';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
  onGenerateFromPrompt?: () => void;
}

const defaultPhases = WEB_DEV_PHASES;

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
  onGenerateFromPrompt,
}: TaskListProps) {
  const { data: templates } = useTaskTemplates();
  const applyTemplates = useApplyTemplates();

  // Compute dynamic phases from tasks, falling back to web dev phases if no tasks
  const dynamicPhases = tasks.length > 0 ? getActivePhases(tasks) : defaultPhases;
  const phases = dynamicPhases.length > 0 ? dynamicPhases : defaultPhases;

  // Group phases by domain and compute domain task counts
  const domainGroups = useMemo(() => groupPhasesByDomain(phases), [phases]);
  const activeDomains = useMemo(() => Object.keys(domainGroups), [domainGroups]);

  const domainTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [domain, domainPhases] of Object.entries(domainGroups)) {
      counts[domain] = tasks.filter(t => domainPhases.some(p => p.id === t.phase)).length;
    }
    return counts;
  }, [domainGroups, tasks]);

  // Default domain: the one with most tasks
  const defaultDomain = useMemo(() => {
    let best = activeDomains[0] ?? 'web_dev';
    let bestCount = 0;
    for (const d of activeDomains) {
      if ((domainTaskCounts[d] ?? 0) > bestCount) {
        bestCount = domainTaskCounts[d];
        best = d;
      }
    }
    return best;
  }, [activeDomains, domainTaskCounts]);

  const [domainFilter, setDomainFilter] = useState<string>(defaultDomain);
  
  // Filtered phases for the selected domain
  const filteredPhases = useMemo(
    () => domainGroups[domainFilter] ?? phases,
    [domainGroups, domainFilter, phases]
  );

  const [activePhase, setActivePhase] = useState<string>(
    filteredPhases.some((p) => p.id === projectPhase) ? projectPhase : filteredPhases[0]?.id ?? 'discovery'
  );

  // When domain changes, auto-select first phase in that domain
  const handleDomainChange = (value: string) => {
    if (!value) return;
    setDomainFilter(value);
    const newPhases = domainGroups[value] ?? [];
    if (newPhases.length > 0 && !newPhases.some(p => p.id === activePhase)) {
      setActivePhase(newPhases[0].id);
    }
  };

  const tasksByPhase = phases.reduce((acc, phase) => {
    acc[phase.id] = tasks.filter((t) => t.phase === phase.id);
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
          {onGenerateFromPrompt && (
            <Button variant="outline" size="sm" onClick={onGenerateFromPrompt}>
              <Wand2 className="h-4 w-4 mr-2" />
              From Prompt
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

      {/* Domain filter - only show if more than one domain has tasks */}
      {activeDomains.length > 1 && (
        <ToggleGroup
          type="single"
          value={domainFilter}
          onValueChange={handleDomainChange}
          variant="outline"
          size="sm"
          className="justify-start gap-1"
        >
          {activeDomains.map((domain) => (
            <ToggleGroupItem
              key={domain}
              value={domain}
              className="text-xs px-3"
            >
              {DOMAIN_LABELS[domain] ?? domain}
              <span className="ml-1.5 text-muted-foreground">
                ({domainTaskCounts[domain] ?? 0})
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      <Tabs value={activePhase} onValueChange={setActivePhase}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {filteredPhases.map((phase) => {
            const stats = getPhaseStats(phase.id);
            return (
              <TabsTrigger
                key={phase.id}
                value={phase.id}
                className={cn(
                  'relative',
                  phase.id === projectPhase && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
              >
                {phase.label}
                {stats.total > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {stats.completed}/{stats.total}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {filteredPhases.map((phase) => (
          <TabsContent key={phase.id} value={phase.id} className="mt-4">
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tasksByPhase[phase.id]?.length > 0 ? (
              <div className="space-y-2">
                {tasksByPhase[phase.id].map((task) => (
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
