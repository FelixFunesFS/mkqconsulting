import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ClientTask } from '@/types/clientTask';
import { ChevronDown, ChevronUp, Check, Minus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientTaskItemProps {
  task: ClientTask;
  isAdmin?: boolean;
  onStatusChange: (taskId: string, status: 'pending' | 'completed' | 'not_applicable') => void;
  onNotesChange?: (taskId: string, notes: string) => void;
  onEdit?: (task: ClientTask) => void;
  onDelete?: (taskId: string) => void;
}

export function ClientTaskItem({
  task,
  isAdmin = false,
  onStatusChange,
  onNotesChange,
  onEdit,
  onDelete,
}: ClientTaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(task.clientNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const isCompleted = task.status === 'completed';
  const isNA = task.status === 'not_applicable';

  const handleToggle = () => {
    if (isNA) return;
    onStatusChange(task.id, isCompleted ? 'pending' : 'completed');
  };

  const handleMarkNA = () => {
    onStatusChange(task.id, isNA ? 'pending' : 'not_applicable');
  };

  const handleSaveNotes = async () => {
    if (!onNotesChange) return;
    setIsSaving(true);
    await onNotesChange(task.id, notes);
    setIsSaving(false);
  };

  const hasNotes = task.clientNotes && task.clientNotes.trim().length > 0;

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        isCompleted && 'bg-emerald-500/5 border-emerald-500/20',
        isNA && 'bg-muted/30 border-muted opacity-60',
        !isCompleted && !isNA && 'hover:border-primary/30'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          disabled={isNA}
          onCheckedChange={handleToggle}
          className={cn(
            "mt-1 transition-colors",
            isCompleted && "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          )}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'font-medium',
                isCompleted && 'text-emerald-700 dark:text-emerald-400',
                isNA && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="h-3 w-3 mr-1" /> Done
              </span>
            )}
            {isNA && (
              <span className="inline-flex items-center text-xs text-muted-foreground">
                <Minus className="h-3 w-3 mr-1" /> Not applicable
              </span>
            )}
            {hasNotes && !expanded && (
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          
          {task.description && (
            <p className={cn(
              "text-sm mt-1",
              isCompleted ? "text-emerald-600/70 dark:text-emerald-400/70" : "text-muted-foreground"
            )}>
              {task.description}
            </p>
          )}
          
          {task.whyNeeded && !isCompleted && (
            <p className="text-xs text-muted-foreground/80 mt-2 italic">
              💡 {task.whyNeeded}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Show N/A option on hover or when expanded - only for non-completed items */}
          {!isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkNA}
              className={cn(
                "text-xs text-muted-foreground hover:text-foreground",
                !isNA && "opacity-0 group-hover:opacity-100 focus:opacity-100",
                isNA && "opacity-100"
              )}
            >
              {isNA ? 'Undo' : "N/A"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pl-8 space-y-3">
          <div>
            <label className="text-sm font-medium">
              {isCompleted ? "Your Response" : "Add a note or response"}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share any details, questions, or notes here..."
              className="mt-1"
              rows={3}
              disabled={isCompleted}
            />
            {notes !== (task.clientNotes || '') && !isCompleted && (
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="mt-2"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-2 pt-2 border-t">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => onDelete(task.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
