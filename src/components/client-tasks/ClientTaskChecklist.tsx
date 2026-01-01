import { useMemo } from 'react';
import { ClientTask, CATEGORY_LABELS, CATEGORY_ORDER, ClientTaskCategory } from '@/types/clientTask';
import { ClientTaskItem } from './ClientTaskItem';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface ClientTaskChecklistProps {
  tasks: ClientTask[];
  isLoading?: boolean;
  isAdmin?: boolean;
  maxHeight?: string;
  onStatusChange: (taskId: string, status: 'pending' | 'completed' | 'not_applicable') => void;
  onNotesChange?: (taskId: string, notes: string) => void;
  onEdit?: (task: ClientTask) => void;
  onDelete?: (taskId: string) => void;
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
}: ClientTaskChecklistProps) {
  // Group tasks by category
  const groupedTasks = useMemo(() => {
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

    tasks.forEach((task) => {
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
  }, [tasks]);

  // Calculate progress
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const applicableCount = tasks.filter((t) => t.status !== 'not_applicable').length;
  const progress = applicableCount > 0 ? Math.round((completedCount / applicableCount) * 100) : 0;

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
        <p>No tasks assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress Summary - Fixed Position */}
      <div className="p-4 bg-muted/50 rounded-lg shrink-0 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {applicableCount} completed ({progress}%)
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Scrollable Task Groups */}
      <div className="flex-1 min-h-0 overflow-hidden" style={{ maxHeight }}>
        <ScrollArea className="h-full">
          <div className="space-y-6 pr-4">
            {CATEGORY_ORDER.map((category) => {
              const categoryTasks = groupedTasks[category];
              if (categoryTasks.length === 0) return null;

              const categoryCompleted = categoryTasks.filter(
                (t) => t.status === 'completed'
              ).length;
              const categoryApplicable = categoryTasks.filter(
                (t) => t.status !== 'not_applicable'
              ).length;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{CATEGORY_LABELS[category]}</h3>
                    <span className="text-sm text-muted-foreground">
                      {categoryCompleted}/{categoryApplicable}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {categoryTasks.map((task) => (
                      <ClientTaskItem
                        key={task.id}
                        task={task}
                        isAdmin={isAdmin}
                        onStatusChange={onStatusChange}
                        onNotesChange={onNotesChange}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
