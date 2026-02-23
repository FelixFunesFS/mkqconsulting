import { Task, statusColors, statusLabels, priorityColors, priorityLabels, TaskStatus } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Clock, MoreVertical, Trash2, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed';

  const handleToggleComplete = () => {
    onStatusChange(task.id, isCompleted ? 'pending' : 'completed');
  };

  const handleStatusChange = (status: TaskStatus) => {
    onStatusChange(task.id, status);
  };

  return (
    <div className={cn(
      'group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30',
      isCompleted && 'opacity-60'
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggleComplete}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'font-medium text-sm leading-tight min-w-0 break-words',
              isCompleted && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </h4>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  Mark as To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  Mark as Done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('blocked')}>
                  Mark as Blocked
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(task.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={cn('text-xs', statusColors[task.status])}>
              {statusLabels[task.status]}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
              {priorityLabels[task.priority]}
            </Badge>
            {task.estimatedHours && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}