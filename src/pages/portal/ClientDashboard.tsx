import { ClientSidebar } from '@/components/layout/ClientSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useProjects } from '@/hooks/useProjects';
import { statusLabels, statusColors } from '@/types/project';
import { useNavigate } from 'react-router-dom';
import { Loader2, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClientDashboard() {
  const { data: projects, isLoading, refetch } = useProjects();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <ClientSidebar />
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your projects</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : projects?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center">Your projects will appear here once they're set up.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Card 
                key={project.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/portal/project/${project.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg truncate">{project.businessName}</CardTitle>
                    <Badge className={cn("shrink-0", statusColors[project.status])}>{statusLabels[project.status]}</Badge>
                  </div>
                  <CardDescription className="truncate">{project.clientName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PullToRefresh>
    </div>
  );
}
