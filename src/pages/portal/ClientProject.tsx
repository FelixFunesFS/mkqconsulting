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
import { statusLabels, statusColors } from '@/types/project';
import { ArrowLeft, CheckCircle2, Clock, Loader2, FileText, Upload, History, MessageCircle } from 'lucide-react';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { ActivityTimeline } from '@/components/activities/ActivityTimeline';
import { CommentThread } from '@/components/comments/CommentThread';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ClientProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks } = useTasks(id);
  const { data: documents, isLoading: documentsLoading } = useDocuments(id || '');
  
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{project.progress}%</div>
              <Progress value={project.progress} className="h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">{completedTasks}/{totalTasks}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Target Launch</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{project.targetLaunchDate || 'TBD'}</span>
            </CardContent>
          </Card>
        </div>

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
                    <ScrollArea className="h-[300px] pr-4">
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
                maxHeight="350px" 
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
                maxHeight="350px" 
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
