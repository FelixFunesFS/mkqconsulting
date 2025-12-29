import { useParams, useNavigate } from 'react-router-dom';
import { ClientSidebar } from '@/components/layout/ClientSidebar';
import { Button } from '@/components/ui/button';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { useProjects } from '@/hooks/useProjects';
import { useQuestionnaire, useUpsertQuestionnaire } from '@/hooks/useQuestionnaires';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ClientQuestionnaire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: projects } = useProjects();
  const { data: questionnaireData, isLoading } = useQuestionnaire(id);
  const upsertQuestionnaire = useUpsertQuestionnaire();
  
  const project = projects?.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <ClientSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar />
      <main className="flex-1 overflow-auto p-8">
        <Button variant="ghost" onClick={() => navigate(`/portal/project/${id}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Project
        </Button>

        <h1 className="text-3xl font-bold mb-2">{project?.businessName} - Questionnaire</h1>
        <p className="text-muted-foreground mb-8">Fill out the details below to help us understand your project needs.</p>

        <QuestionnaireForm
          initialData={questionnaireData}
          onSubmit={async (data) => {
            if (id) {
              await upsertQuestionnaire.mutateAsync({ projectId: id, data });
              toast({ title: 'Saved', description: 'Your questionnaire has been updated.' });
              navigate(`/portal/project/${id}`);
            }
          }}
          onCancel={() => navigate(`/portal/project/${id}`)}
        />
      </main>
    </div>
  );
}
