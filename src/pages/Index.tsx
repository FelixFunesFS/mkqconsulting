import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { ProjectTasksDialog } from '@/components/tasks/ProjectTasksDialog';
import { useProjects, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { useQuestionnaire, useUpsertQuestionnaire } from '@/hooks/useQuestionnaires';
import { Project, QuestionnaireData } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const upsertQuestionnaire = useUpsertQuestionnaire();
  
  // Fetch questionnaire data when viewing/editing
  const { data: questionnaireData, isLoading: isQuestionnaireLoading } = useQuestionnaire(
    (showQuestionnaire || showNewProject) && selectedProject?.id ? selectedProject.id : undefined
  );

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleViewQuestionnaire = (project: Project) => {
    setSelectedProject(project);
    setShowQuestionnaire(true);
  };

  const handleViewTasks = (project: Project) => {
    setSelectedProject(project);
    setShowTasks(true);
  };

  const handleViewDocuments = (project: Project) => {
    // Documents not implemented in Index.tsx yet - placeholder
    console.log('View documents for', project.id);
  };

  const handleNewProject = () => {
    setSelectedProject(null);
    setShowNewProject(true);
  };

  const handleQuestionnaireSubmit = async (data: QuestionnaireData) => {
    try {
      if (selectedProject) {
        // Update existing project and questionnaire
        await updateProject.mutateAsync({
          id: selectedProject.id,
          businessName: data.businessName,
        });
        await upsertQuestionnaire.mutateAsync({
          projectId: selectedProject.id,
          data,
        });
        toast({
          title: 'Questionnaire Updated',
          description: `Questionnaire for ${selectedProject.businessName} has been updated.`,
        });
      } else {
        // Create new project and questionnaire
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
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
    setShowNewProject(false);
    setShowQuestionnaire(false);
    setSelectedProject(null);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'questionnaire') {
      setSelectedProject(null);
      setShowNewProject(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onNewProject={handleNewProject}
      />
      
      <main className="pl-64 transition-all duration-300">
        <div className="p-8">
          {currentView === 'dashboard' && (
            <Dashboard
              projects={projects}
              onProjectClick={handleProjectClick}
              onEditProject={handleEditProject}
              onViewQuestionnaire={handleViewQuestionnaire}
              onViewTasks={handleViewTasks}
              onViewDocuments={handleViewDocuments}
            />
          )}
          
          {currentView === 'projects' && (
            <Dashboard
              projects={projects}
              onProjectClick={handleProjectClick}
              onEditProject={handleEditProject}
              onViewQuestionnaire={handleViewQuestionnaire}
              onViewTasks={handleViewTasks}
              onViewDocuments={handleViewDocuments}
            />
          )}

          {currentView === 'clients' && (
            <div className="space-y-6">
              <h1 className="font-display text-3xl font-bold">Clients</h1>
              <p className="text-muted-foreground">Client management coming soon...</p>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="space-y-6">
              <h1 className="font-display text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Settings page coming soon...</p>
            </div>
          )}
        </div>
      </main>

      {/* Tasks Dialog */}
      <ProjectTasksDialog
        project={selectedProject}
        open={showTasks}
        onOpenChange={(open) => {
          setShowTasks(open);
          if (!open) setSelectedProject(null);
        }}
      />

      {/* New Project / Questionnaire Modal */}
      <Dialog open={showNewProject || showQuestionnaire} onOpenChange={(open) => {
        if (!open) {
          setShowNewProject(false);
          setShowQuestionnaire(false);
          setSelectedProject(null);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {selectedProject 
                ? `${selectedProject.businessName} - Discovery Questionnaire`
                : 'Website Discovery Questionnaire'
              }
            </DialogTitle>
          </DialogHeader>
          {isQuestionnaireLoading && selectedProject ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <QuestionnaireForm
              initialData={questionnaireData}
              onSubmit={handleQuestionnaireSubmit}
              onCancel={() => {
                setShowNewProject(false);
                setShowQuestionnaire(false);
                setSelectedProject(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;