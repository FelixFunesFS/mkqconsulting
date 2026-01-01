import { useParams, useNavigate } from 'react-router-dom';
import { ClientSidebar } from '@/components/layout/ClientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useDocuments } from '@/hooks/useDocuments';
import { useClientTasks, useUpdateClientTask } from '@/hooks/useClientTasks';
import { statusLabels, statusColors } from '@/types/project';
import { ArrowLeft, Loader2, FileText, Upload, History, MessageCircle, ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { ActivityTimeline } from '@/components/activities/ActivityTimeline';
import { CommentThread } from '@/components/comments/CommentThread';
import { ClientProjectSummary } from '@/components/tasks/ClientProjectSummary';
import { ClientTaskChecklist } from '@/components/client-tasks/ClientTaskChecklist';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
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
  const [showActivity, setShowActivity] = useState(false);
  
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks(id);
  const { data: documents, isLoading: documentsLoading } = useDocuments(id || '');
  const { data: clientTasks = [], isLoading: clientTasksLoading } = useClientTasks(id);
  const updateClientTask = useUpdateClientTask();
  
  const project = projects?.find(p => p.id === id);

  if (projectsLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <ClientSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-background">
        <ClientSidebar />
        <main className="flex-1 p-8">
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

  return (
    <div className="flex min-h-screen bg-background">
      <ClientSidebar />
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <Button variant="ghost" onClick={() => navigate('/portal')} className="mb-4">
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
                <h1 className="text-2xl md:text-3xl font-bold">{project.businessName}</h1>
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

        {/* Section 1: Your To-Do List (Client Tasks) - Priority #1 */}
        {clientTasks.length > 0 && (
          <Card className="mb-6">
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
                maxHeight="min(400px, 50vh)"
                onStatusChange={handleClientTaskStatusChange}
                onNotesChange={handleClientTaskNotesChange}
              />
            </CardContent>
          </Card>
        )}

        {/* Section 2: Project Progress - Priority #2 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              What's Happening
            </CardTitle>
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

        {/* Section 3: Communication - Discussion + Documents */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
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
                maxHeight="min(350px, 45vh)" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Files & Documents
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                View shared files or upload your own
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="documents">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="documents">View Files</TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="documents">
                  {documentsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[min(250px,35vh)] pr-4">
                      <DocumentList
                        documents={documents || []}
                        projectId={project.id}
                        isAdmin={false}
                        groupByCategory={true}
                      />
                    </ScrollArea>
                  )}
                </TabsContent>

                <TabsContent value="upload">
                  <DocumentUploader
                    projectId={project.id}
                    isAdmin={false}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Section 4: Questionnaire - Compact */}
        <Card className="mb-6">
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

        {/* Section 5: Activity - Collapsible */}
        <Collapsible open={showActivity} onOpenChange={setShowActivity}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" /> Recent Activity
                  </CardTitle>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    showActivity && "rotate-180"
                  )} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <ActivityTimeline 
                  projectId={project.id} 
                  isAdmin={false} 
                  maxHeight="min(300px, 40vh)" 
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </main>
    </div>
  );
}
