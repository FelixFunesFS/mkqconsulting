import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { QuestionnaireForm } from '@/components/questionnaire/QuestionnaireForm';
import { mockProjects } from '@/data/mockProjects';
import { Project, QuestionnaireData } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    // Could open edit modal here
  };

  const handleViewQuestionnaire = (project: Project) => {
    setSelectedProject(project);
    setShowQuestionnaire(true);
  };

  const handleNewProject = () => {
    setSelectedProject(null);
    setShowNewProject(true);
  };

  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    if (selectedProject) {
      // Update existing project
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id ? { ...p, questionnaire: data } : p
        )
      );
      toast({
        title: 'Questionnaire Updated',
        description: `Questionnaire for ${selectedProject.businessName} has been updated.`,
      });
    } else {
      // Create new project
      const newProject: Project = {
        id: String(Date.now()),
        clientName: 'New Client',
        businessName: data.businessName || 'New Business',
        status: 'discovery',
        progress: 5,
        tasksCompleted: 1,
        totalTasks: 20,
        startDate: new Date().toISOString().split('T')[0],
        questionnaire: data,
      };
      setProjects((prev) => [...prev, newProject]);
      toast({
        title: 'Project Created',
        description: `New project "${data.businessName}" has been created.`,
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
            />
          )}
          
          {currentView === 'projects' && (
            <Dashboard
              projects={projects}
              onProjectClick={handleProjectClick}
              onEditProject={handleEditProject}
              onViewQuestionnaire={handleViewQuestionnaire}
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
          <QuestionnaireForm
            initialData={selectedProject?.questionnaire}
            onSubmit={handleQuestionnaireSubmit}
            onCancel={() => {
              setShowNewProject(false);
              setShowQuestionnaire(false);
              setSelectedProject(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
