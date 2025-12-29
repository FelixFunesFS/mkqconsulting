import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { ClientSelector } from '@/components/projects/ClientSelector';
import { useCreateProject } from '@/hooks/useProjects';
import { useUpsertQuestionnaire } from '@/hooks/useQuestionnaires';
import { useClients } from '@/hooks/useClients';
import { QuestionnaireData } from '@/types/project';
import { useToast } from '@/hooks/use-toast';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDialog({ open, onOpenChange }: ProjectDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const createProject = useCreateProject();
  const upsertQuestionnaire = useUpsertQuestionnaire();
  const { data: clients } = useClients();
  const { toast } = useToast();

  const handleSubmit = async (data: QuestionnaireData) => {
    try {
      const selectedClient = clients?.find(c => c.id === selectedClientId);
      
      const newProject = await createProject.mutateAsync({
        clientName: selectedClient?.name || 'New Client',
        businessName: data.businessName || 'New Business',
        status: 'discovery',
        progress: 5,
        tasksCompleted: 1,
        totalTasks: 20,
        startDate: new Date().toISOString().split('T')[0],
        clientId: selectedClientId || undefined,
      });
      await upsertQuestionnaire.mutateAsync({
        projectId: newProject.id,
        data,
      });
      toast({
        title: 'Project Created',
        description: `New project "${data.businessName}" has been created.`,
      });
      setSelectedClientId(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setSelectedClientId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) handleCancel(); else onOpenChange(open); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Website Discovery Questionnaire
          </DialogTitle>
        </DialogHeader>
        
        {/* Client Selection */}
        <div className="mb-6 p-4 rounded-lg bg-secondary/30 border border-border">
          <Label className="text-sm font-medium mb-2 block">
            Link to Client (Optional)
          </Label>
          <ClientSelector
            value={selectedClientId || undefined}
            onSelect={setSelectedClientId}
            placeholder="Select a client to give them portal access..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            If linked, the client can view project progress and fill out the questionnaire themselves.
          </p>
        </div>

        <QuestionnaireForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
