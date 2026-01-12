import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClientTaskTemplateSets, useApplyClientTaskTemplate } from '@/hooks/useClientTasks';
import { toast } from '@/hooks/use-toast';
import { sendNotification, getClientEmailForProject } from '@/lib/notifications';
import { Loader2 } from 'lucide-react';

interface ApplyTemplateDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEMPLATE_SET_LABELS: Record<string, string> = {
  month_1_onboarding: 'Month 1 - Foundation & Funnel Lock-In',
};

export function ApplyTemplateDialog({
  projectId,
  open,
  onOpenChange,
}: ApplyTemplateDialogProps) {
  const [selectedSet, setSelectedSet] = useState<string>('');
  
  const { data: templateSets = [], isLoading: isLoadingSets } = useClientTaskTemplateSets();
  const applyTemplate = useApplyClientTaskTemplate();

  const handleApply = async () => {
    if (!selectedSet) return;

    try {
      const result = await applyTemplate.mutateAsync({
        projectId,
        templateSet: selectedSet,
      });

      // Send notification about new tasks
      if (result.length > 0) {
        const clientInfo = await getClientEmailForProject(projectId);
        if (clientInfo) {
          sendNotification({
            type: 'client_task_assigned',
            projectId,
            projectName: clientInfo.projectName,
            clientEmail: clientInfo.email,
            details: {
              taskCount: result.length,
            },
          });
        }
      }

      toast({
        title: 'Template Applied',
        description: `Added ${result.length} client tasks from the template.`,
      });

      onOpenChange(false);
      setSelectedSet('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to apply template',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply Client Task Template</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">Select Template Set</label>
          {isLoadingSets ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading templates...
            </div>
          ) : (
            <Select value={selectedSet} onValueChange={setSelectedSet}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {templateSets.map((set) => (
                  <SelectItem key={set} value={set}>
                    {TEMPLATE_SET_LABELS[set] || set}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedSet && (
            <p className="text-sm text-muted-foreground mt-2">
              This will add all tasks from the selected template to this project.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedSet || applyTemplate.isPending}
          >
            {applyTemplate.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
