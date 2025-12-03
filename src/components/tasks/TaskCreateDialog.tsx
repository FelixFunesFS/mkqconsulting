import { useState } from 'react';
import { TaskStatus, TaskPriority, statusLabels, priorityLabels } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statusLabels as phaseLabels } from '@/types/project';

interface TaskCreateDialogProps {
  projectId: string;
  currentPhase: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: {
    project_id: string;
    title: string;
    description?: string;
    phase: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    estimated_hours?: number;
    due_date?: string;
    assigned_to?: string;
    source: 'manual';
  }) => void;
}

const phases = ['discovery', 'design', 'development', 'review', 'published'] as const;
const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export function TaskCreateDialog({ projectId, currentPhase, open, onOpenChange, onSave }: TaskCreateDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState(currentPhase);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleSave = () => {
    onSave({
      project_id: projectId,
      title,
      description: description || undefined,
      phase,
      priority,
      status: 'pending',
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      due_date: dueDate || undefined,
      assigned_to: assignedTo || undefined,
      source: 'manual',
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setPhase(currentPhase);
    setPriority('medium');
    setEstimatedHours('');
    setDueDate('');
    setAssignedTo('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((p) => (
                    <SelectItem key={p} value={p}>
                      {phaseLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Est. Hours</Label>
              <Input
                id="hours"
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
