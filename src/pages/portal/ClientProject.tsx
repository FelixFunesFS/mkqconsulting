import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ClientSidebar } from '@/components/layout/ClientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useDocuments } from '@/hooks/useDocuments';
import { useClientTasks, useUpdateClientTask } from '@/hooks/useClientTasks';
import { statusLabels, statusColors } from '@/types/project';
import { ArrowLeft, Loader2, FileText, Upload, History, MessageCircle, HelpCircle, Sparkles, LayoutDashboard } from 'lucide-react';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { ActivityTimeline } from '@/components/activities/ActivityTimeline';
import { CommentThread } from '@/components/comments/CommentThread';
import { ClientProjectSummary } from '@/components/tasks/ClientProjectSummary';
import { ClientTaskChecklist } from '@/components/client-tasks/ClientTaskChecklist';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Friendly status messages for the banner
const statusMessages: Record<string, { message: string; subtext: string }> = {
  discovery: {
    message: "Getting to know your business",
    subtext: "We're gathering information to create the perfect website for you."
  },
  design: {
    message: "Designing your website",
    subtext: "Creating mockups and visual designs for your approval."
  },
  development: {
    message: "Building your website",
    subtext: "Turning designs into a fully functional website."
  },
  review: {
    message: "Final review in progress",
    subtext: "Checking everything before we go live."
  },
  published: {
    message: "Your website is live!",
    subtext: "Congratulations! Your site is now available to the world."
  },
};

export default function ClientProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useProjects();
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks(id);
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = useDocuments(id || '');
  const { data: clientTasks = [], isLoading: clientTasksLoading, refetch: refetchClientTasks } = useClientTasks(id);
  const updateClientTask = useUpdateClientTask();

  const handleRefresh = async () => {
    await Promise.all([
      refetchProjects(),
      refetchTasks(),
      refetchDocuments(),
      refetchClientTasks(),
    ]);
  };
  
  const project = projects?.find(p => p.id === id);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  if (projectsLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
        <ClientSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
        <ClientSidebar />
        <main className="flex-1 p-4 md:p-8">
          <p>Project not found</p>
        </main>
      </div>
    );
  }

  const statusInfo = statusMessages[project.status] || statusMessages.discovery;

  const handleClientTaskStatusChange = async (
    taskId: string,
    status: 'pending' | 'completed' | 'not_applicable'
  ) => {
    if (!id) return;
    try {
      const completedAt = status === 'completed' ? new Date().toISOString() : null;
      await updateClientTask.mutateAsync({
        id: taskId,
        projectId: id,
        status,
        completedAt,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const handleClientTaskNotesChange = async (taskId: string, notes: string) => {
    if (!id) return;
    try {
      await updateClientTask.mutateAsync({
        id: taskId,
        projectId: id,
        clientNotes: notes,
      });
      toast({
        title: 'Notes Saved',
        description: 'Your notes have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    }
  };

  const pendingClientTasks = clientTasks.filter(t => t.status === 'pending').length;
  const unreadMessages = 0; // Placeholder for future notification system

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
      <ClientSidebar />
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate('/portal')} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Status Banner */}
        <div className={cn(
          "rounded-xl p-6 mb-6 border",
          project.status === 'published' 
            ? "bg-emerald-500/5 border-emerald-500/20" 
            : "bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/10"
        )}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{project.businessName}</h1>
                <Badge className={cn(statusColors[project.status], "hidden sm:inline-flex")}>
                  {statusLabels[project.status]}
                </Badge>
              </div>
              <p className="text-lg font-medium text-foreground/80">{statusInfo.message}</p>
              <p className="text-sm text-muted-foreground">{statusInfo.subtext}</p>
            </div>
            <Badge className={cn(statusColors[project.status], "sm:hidden w-fit")}>
              {statusLabels[project.status]}
            </Badge>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="flex w-full justify-between sm:justify-start sm:gap-1 sm:w-auto">
            <TabsTrigger value="overview" className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              {pendingClientTasks > 0 && (
                <Badge variant="secondary" className="h-5 min-w-5 text-xs px-1.5">
                  {pendingClientTasks}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Client Tasks + Questionnaire */}
          <TabsContent value="overview" className="space-y-6">
            {clientTasks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> 
                    We Need Your Help
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete these items to keep your project moving forward
                  </p>
                </CardHeader>
                <CardContent>
                  <ClientTaskChecklist
                    tasks={clientTasks}
                    isLoading={clientTasksLoading}
                    isAdmin={false}
                    maxHeight="min(500px, 60vh)"
                    onStatusChange={handleClientTaskStatusChange}
                    onNotesChange={handleClientTaskNotesChange}
                  />
                </CardContent>
              </Card>
            )}

            {clientTasks.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">You're all caught up!</h3>
                  <p className="text-muted-foreground">
                    No pending items from your side. We'll notify you when we need your input.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">Project Questionnaire</h4>
                      <p className="text-sm text-muted-foreground">
                        Help us understand your business better
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate(`/portal/questionnaire/${project.id}`)}>
                    View Questionnaire
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab - What's Happening + Activity */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>What's Happening</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track your project's progress through each phase
                </p>
              </CardHeader>
              <CardContent>
                <ClientProjectSummary 
                  tasks={tasks || []} 
                  isLoading={tasksLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" /> Recent Activity
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  A timeline of updates on your project
                </p>
              </CardHeader>
              <CardContent>
                <ActivityTimeline 
                  projectId={project.id} 
                  isAdmin={false} 
                  maxHeight="min(500px, 60vh)" 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Shared Files
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Documents shared with you by the project team
                  </p>
                </CardHeader>
                <CardContent>
                  {documentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[min(400px,50vh)] pr-4">
                      <DocumentList
                        documents={documents || []}
                        projectId={project.id}
                        isAdmin={false}
                        groupByCategory={true}
                      />
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" /> Upload Files
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Share files with the project team
                  </p>
                </CardHeader>
                <CardContent>
                  <DocumentUploader
                    projectId={project.id}
                    isAdmin={false}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" /> Messages
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Chat directly with your project team
                </p>
              </CardHeader>
              <CardContent>
                <CommentThread 
                  projectId={project.id} 
                  isAdmin={false} 
                  maxHeight="min(600px, 70vh)" 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PullToRefresh>
    </div>
  );
}