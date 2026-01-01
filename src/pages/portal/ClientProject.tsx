import { useParams, useNavigate } from 'react-router-dom';
import { ClientSidebar } from '@/components/layout/ClientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useDocuments } from '@/hooks/useDocuments';
import { useClientTasks, useUpdateClientTask } from '@/hooks/useClientTasks';
import { statusLabels, statusColors } from '@/types/project';
import { ArrowLeft, CheckCircle2, Clock, Loader2, FileText, Upload, History, MessageCircle, ListTodo, ClipboardCheck } from 'lucide-react';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { ActivityTimeline } from '@/components/activities/ActivityTimeline';
import { CommentThread } from '@/components/comments/CommentThread';
import { ClientTaskList } from '@/components/tasks/ClientTaskList';
import { ClientTaskChecklist } from '@/components/client-tasks/ClientTaskChecklist';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

export default function ClientProject() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
  const totalTasks = tasks?.length || 0;

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
      <main className="flex-1 overflow-auto p-8">
        <Button variant="ghost" onClick={() => navigate('/portal')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{project.businessName}</h1>
            <p className="text-muted-foreground">{project.clientName}</p>
          </div>
          <Badge className={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
        </div>

        {/* Client Tasks Checklist - Full Width */}
        {clientTasks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" /> Your Action Items
              </CardTitle>
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

        {/* Project Tasks - Full Width */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" /> Project Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientTaskList 
              tasks={tasks || []} 
              projectId={project.id}
              isLoading={tasksLoading}
              maxHeight="min(400px, 50vh)"
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Questionnaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(`/portal/questionnaire/${project.id}`)}>
                View & Edit Questionnaire
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="documents">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="documents">View Documents</TabsTrigger>
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
                    <ScrollArea className="h-[min(300px,40vh)] pr-4">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> Discussion
              </CardTitle>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline 
                projectId={project.id} 
                isAdmin={false} 
                maxHeight="min(350px, 45vh)" 
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
