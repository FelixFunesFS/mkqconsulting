import { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { ProjectEditDialog } from '@/components/projects/ProjectEditDialog';
import { ProjectTasksDialog } from '@/components/tasks/ProjectTasksDialog';
import { useProjects } from '@/hooks/useProjects';
import { useQuestionnaire, useUpsertQuestionnaire } from '@/hooks/useQuestionnaires';
import { Project, QuestionnaireData } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: projects = [], isLoading } = useProjects();
  const upsertQuestionnaire = useUpsertQuestionnaire();
  const { data: questionnaireData, isLoading: isQuestionnaireLoading } = useQuestionnaire(
    showQuestionnaire && selectedProject?.id ? selectedProject.id : undefined
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar onNewProject={() => setProjectDialogOpen(true)} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar onNewProject={() => setProjectDialogOpen(true)} />
      <main className="flex-1 overflow-auto p-8">
        <Dashboard
          projects={projects}
          onProjectClick={(p) => { setSelectedProject(p); setShowTasks(true); }}
          onEditProject={(p) => { setSelectedProject(p); setShowEditDialog(true); }}
          onViewQuestionnaire={(p) => { setSelectedProject(p); setShowQuestionnaire(true); }}
          onViewTasks={(p) => { setSelectedProject(p); setShowTasks(true); }}
        />
      </main>
      
      <ProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
      
      <ProjectEditDialog
        project={selectedProject}
        open={showEditDialog}
        onOpenChange={(open) => { setShowEditDialog(open); if (!open) setSelectedProject(null); }}
      />
      
      <ProjectTasksDialog
        project={selectedProject}
        open={showTasks}
        onOpenChange={(open) => { setShowTasks(open); if (!open) setSelectedProject(null); }}
      />
      
      <Dialog open={showQuestionnaire} onOpenChange={(open) => { setShowQuestionnaire(open); if (!open) setSelectedProject(null); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.businessName} - Questionnaire</DialogTitle>
          </DialogHeader>
          {isQuestionnaireLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <QuestionnaireForm
              initialData={questionnaireData}
              onSubmit={async (data) => {
                if (selectedProject) {
                  await upsertQuestionnaire.mutateAsync({ projectId: selectedProject.id, data });
                }
                setShowQuestionnaire(false);
                setSelectedProject(null);
              }}
              onCancel={() => { setShowQuestionnaire(false); setSelectedProject(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
