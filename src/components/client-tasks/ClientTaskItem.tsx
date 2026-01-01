import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClientTask, PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/clientTask';
import { ChevronDown, ChevronUp, Check, X, Minus } from 'lucide-react';
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
  const priorityConfig = PRIORITY_CONFIG[task.priority];

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

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        isCompleted && 'bg-muted/50 border-muted',
        isNA && 'bg-muted/30 border-muted opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          disabled={isNA}
          onCheckedChange={handleToggle}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'font-medium',
                isCompleted && 'line-through text-muted-foreground',
                isNA && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
            <Badge variant="outline" className={cn('text-xs', priorityConfig.color)}>
              {priorityConfig.label}
            </Badge>
            {isCompleted && (
              <Badge variant="secondary" className="text-xs text-green-600">
                <Check className="h-3 w-3 mr-1" /> Done
              </Badge>
            )}
            {isNA && (
              <Badge variant="secondary" className="text-xs">
                <Minus className="h-3 w-3 mr-1" /> N/A
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
          
          {task.whyNeeded && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Why: {task.whyNeeded}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && !isNA && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkNA}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="ml-1 text-xs">N/A</span>
            </Button>
          )}
          {isNA && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkNA}
              className="text-muted-foreground hover:text-foreground"
            >
              Undo N/A
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
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
            <label className="text-sm font-medium">Your Notes / Response</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes, answers, or details here..."
              className="mt-1"
              rows={3}
            />
            {notes !== (task.clientNotes || '') && (
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="mt-2"
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
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
