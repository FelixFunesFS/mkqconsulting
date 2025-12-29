import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { useCreateProject } from '@/hooks/useProjects';
import { useUpsertQuestionnaire } from '@/hooks/useQuestionnaires';
import { QuestionnaireData } from '@/types/project';
import { useToast } from '@/hooks/use-toast';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDialog({ open, onOpenChange }: ProjectDialogProps) {
  const createProject = useCreateProject();
  const upsertQuestionnaire = useUpsertQuestionnaire();
  const { toast } = useToast();

  const handleSubmit = async (data: QuestionnaireData) => {
    try {
      const newProject = await createProject.mutateAsync({
        clientName: 'New Client',
        businessName: data.businessName || 'New Business',
        status: 'discovery',
        progress: 5,
        tasksCompleted: 1,
        totalTasks: 20,
        startDate: new Date().toISOString().split('T')[0],
      });
      await upsertQuestionnaire.mutateAsync({
        projectId: newProject.id,
        data,
      });
      toast({
        title: 'Project Created',
        description: `New project "${data.businessName}" has been created.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Website Discovery Questionnaire
          </DialogTitle>
        </DialogHeader>
        <QuestionnaireForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
