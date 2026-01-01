import { useMemo, useState } from 'react';
import { ClientTask, CATEGORY_LABELS, CATEGORY_ORDER, ClientTaskCategory } from '@/types/clientTask';
import { ClientTaskItem } from './ClientTaskItem';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientTaskChecklistProps {
  tasks: ClientTask[];
  isLoading?: boolean;
  isAdmin?: boolean;
  maxHeight?: string;
  onStatusChange: (taskId: string, status: 'pending' | 'completed' | 'not_applicable') => void;
  onNotesChange?: (taskId: string, notes: string) => void;
  onEdit?: (task: ClientTask) => void;
  onDelete?: (taskId: string) => void;
  onVisibilityChange?: (taskId: string, visible: boolean) => void;
}

export function ClientTaskChecklist({
  tasks,
  isLoading = false,
  isAdmin = false,
  maxHeight = '600px',
  onStatusChange,
  onNotesChange,
  onEdit,
  onDelete,
  onVisibilityChange,
}: ClientTaskChecklistProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  // Separate completed and pending tasks
  const { pendingTasks, completedTasks, groupedPending, groupedCompleted } = useMemo(() => {
    const pending = tasks.filter(t => t.status !== 'completed');
    const completed = tasks.filter(t => t.status === 'completed');

    const groupTasks = (taskList: ClientTask[]) => {
      const groups: Record<ClientTaskCategory, ClientTask[]> = {
        access: [],
        approvals: [],
        content: [],
        assets: [],
        messaging: [],
        incentives: [],
        seo: [],
        other: [],
      };

      taskList.forEach((task) => {
        if (groups[task.category]) {
          groups[task.category].push(task);
        } else {
          groups.other.push(task);
        }
      });

      // Sort each group by display_order
      Object.keys(groups).forEach((key) => {
        groups[key as ClientTaskCategory].sort((a, b) => a.displayOrder - b.displayOrder);
      });

      return groups;
    };

    return {
      pendingTasks: pending,
      completedTasks: completed,
      groupedPending: groupTasks(pending),
      groupedCompleted: groupTasks(completed),
    };
  }, [tasks]);

  // Calculate progress
  const completedCount = completedTasks.length;
  const applicableCount = tasks.filter((t) => t.status !== 'not_applicable').length;
  const progress = applicableCount > 0 ? Math.round((completedCount / applicableCount) * 100) : 0;

  // Friendly progress message
  const getProgressMessage = () => {
    if (progress === 100) return "All done! Great work! 🎉";
    if (progress >= 75) return "Almost there! Just a few more to go.";
    if (progress >= 50) return "Halfway there! Keep it up!";
    if (progress >= 25) return "Good progress! You're on your way.";
    if (progress > 0) return "Great start! Let's keep going.";
    return "Let's get started!";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No action items yet</p>
        <p className="text-sm">We'll add items here when we need your help.</p>
      </div>
    );
  }

  const renderTaskGroup = (
    groupedTasks: Record<ClientTaskCategory, ClientTask[]>,
    showCategoryHeaders: boolean = true
  ) => (
    <div className="space-y-4">
      {CATEGORY_ORDER.map((category) => {
        const categoryTasks = groupedTasks[category];
        if (categoryTasks.length === 0) return null;

        return (
          <div key={category} className="group">
            {showCategoryHeaders && (
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {CATEGORY_LABELS[category]}
              </h4>
            )}
            <div className="space-y-2">
              {categoryTasks.map((task) => (
                <ClientTaskItem
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  onStatusChange={onStatusChange}
                  onNotesChange={onNotesChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onVisibilityChange={onVisibilityChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Count visible tasks for admin summary
  const visibleCount = tasks.filter(t => t.visibleToClient).length;

  return (
    <div className="flex flex-col h-full">
      {/* Progress Summary */}
      <div className={cn(
        "p-4 rounded-lg shrink-0 mb-4 transition-colors",
        progress === 100 ? "bg-emerald-500/10" : "bg-muted/50"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{getProgressMessage()}</span>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="text-xs text-muted-foreground">
                {visibleCount}/{tasks.length} visible
              </span>
            )}
            <span className={cn(
              "text-lg font-bold",
              progress === 100 && "text-emerald-600 dark:text-emerald-400"
            )}>
              {completedCount}/{applicableCount}
            </span>
          </div>
        </div>
        <Progress 
          value={progress} 
          className={cn(
            "h-2",
            progress === 100 && "[&>div]:bg-emerald-500"
          )} 
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="pr-4 space-y-6">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {pendingTasks.length}
                  </span>
                  Items needing your attention
                </h3>
                {renderTaskGroup(groupedPending)}
              </div>
            )}

            {/* Completed Tasks (Collapsible) */}
            {completedTasks.length > 0 && (
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full justify-between text-muted-foreground hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                      {completedTasks.length}
                    </span>
                    Completed items
                  </span>
                  {showCompleted ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                
                {showCompleted && (
                  <div className="mt-3">
                    {renderTaskGroup(groupedCompleted, false)}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
