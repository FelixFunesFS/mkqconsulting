import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateActivity } from '@/hooks/useActivities';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddNoteDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNoteDialog({ projectId, open, onOpenChange }: AddNoteDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibleToClient, setVisibleToClient] = useState(true);
  const createActivity = useCreateActivity();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      await createActivity.mutateAsync({
        projectId,
        activityType: 'note_added',
        title: title.trim(),
        description: description.trim() || undefined,
        visibleToClient,
      });
      toast({ title: 'Note added' });
      setTitle('');
      setDescription('');
      setVisibleToClient(true);
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Failed to add note', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Client approved homepage design"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="visible" className="text-sm">Visible to client</Label>
            <Switch
              id="visible"
              checked={visibleToClient}
              onCheckedChange={setVisibleToClient}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || createActivity.isPending}>
            {createActivity.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
