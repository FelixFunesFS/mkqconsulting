import { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ProjectPipeline } from '@/components/dashboard/ProjectPipeline';
import { ProjectDialog } from '@/components/projects/ProjectDialog';
import { useProjects } from '@/hooks/useProjects';
import { Loader2 } from 'lucide-react';

export default function AdminProjects() {
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar onNewProject={() => setProjectDialogOpen(true)} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all projects by status
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ProjectPipeline projects={projects || []} />
          )}
        </div>
      </main>
      <ProjectDialog 
        open={projectDialogOpen} 
        onOpenChange={setProjectDialogOpen}
      />
    </div>
  );
}
