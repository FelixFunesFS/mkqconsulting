import { Loader2, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentUploader } from './DocumentUploader';
import { DocumentList } from './DocumentList';
import { Project } from '@/types/project';

interface ProjectDocumentsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDocumentsDialog({ project, open, onOpenChange }: ProjectDocumentsDialogProps) {
  const { data: documents, isLoading } = useDocuments(project?.id || '');

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents - {project.businessName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="documents" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">All Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <DocumentList
                  documents={documents || []}
                  projectId={project.id}
                  isAdmin={true}
                  groupByCategory={true}
                />
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <DocumentUploader
              projectId={project.id}
              isAdmin={true}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
