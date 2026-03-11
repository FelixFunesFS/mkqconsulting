import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Client } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useClientProjects, useAddProjectClient, useRemoveProjectClient } from '@/hooks/useProjectClients';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ClientProjectsDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientProjectsDialog({ client, open, onOpenChange }: ClientProjectsDialogProps) {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: clientProjects, isLoading: clientProjectsLoading } = useClientProjects(client?.id);
  const addProjectClient = useAddProjectClient();
  const removeProjectClient = useRemoveProjectClient();
  const { toast } = useToast();

  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = projectsLoading || clientProjectsLoading;

  // Initialize from junction table
  useEffect(() => {
    if (clientProjects) {
      setSelectedProjectIds(new Set(clientProjects.map((cp) => cp.projectId)));
    }
  }, [clientProjects]);

  const handleToggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!client || !clientProjects) return;

    setIsSaving(true);
    try {
      const currentIds = new Set(clientProjects.map((cp) => cp.projectId));
      const updates: Promise<any>[] = [];

      // Add new assignments
      for (const projectId of selectedProjectIds) {
        if (!currentIds.has(projectId)) {
          updates.push(addProjectClient.mutateAsync({ projectId, clientId: client.id }));
        }
      }

      // Remove old assignments
      for (const projectId of currentIds) {
        if (!selectedProjectIds.has(projectId)) {
          updates.push(removeProjectClient.mutateAsync({ projectId, clientId: client.id }));
        }
      }

      await Promise.all(updates);

      toast({
        title: 'Projects updated',
        description: `Updated project assignments for ${client.name}.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update projects',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Projects</DialogTitle>
          <DialogDescription>
            Select which projects {client?.name} should have access to.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : projects?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No projects found. Create a project first.
            </p>
          ) : (
            <div className="space-y-2">
              {projects?.map((project) => {
                const isSelected = selectedProjectIds.has(project.id);

                return (
                  <div
                    key={project.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                    onClick={() => handleToggleProject(project.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleProject(project.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{project.businessName}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {project.clientName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
