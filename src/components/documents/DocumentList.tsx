import { useState } from 'react';
import { FileText, Download, Trash2, Eye, EyeOff, MoreVertical, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteDocument, useUpdateDocument, useDocumentDownloadUrl } from '@/hooks/useDocuments';
import { ProjectDocument, CATEGORY_LABELS, DocumentCategory } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface DocumentListProps {
  documents: ProjectDocument[];
  projectId: string;
  isAdmin?: boolean;
  groupByCategory?: boolean;
}

function DocumentItem({ doc, projectId, isAdmin }: { doc: ProjectDocument; projectId: string; isAdmin: boolean }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const deleteDocument = useDeleteDocument();
  const updateDocument = useUpdateDocument();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('project-documents')
        .createSignedUrl(doc.filePath, 3600);

      if (error) throw error;
      
      // Open in new tab
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleVisibility = () => {
    updateDocument.mutate({
      id: doc.id,
      projectId,
      visibleToClient: !doc.visibleToClient,
    });
  };

  const handleDelete = () => {
    deleteDocument.mutate({
      id: doc.id,
      filePath: doc.filePath,
      projectId,
      fileName: doc.name,
    });
    setDeleteDialogOpen(false);
  };

  const fileSize = doc.fileSize 
    ? doc.fileSize < 1024 * 1024
      ? `${(doc.fileSize / 1024).toFixed(1)} KB`
      : `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`
    : null;

  const canDelete = isAdmin || doc.category === 'client_uploads';

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors overflow-hidden">
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate max-w-[180px] sm:max-w-[280px] lg:max-w-none">{doc.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {fileSize && <span>{fileSize}</span>}
              <span>•</span>
              <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
              {isAdmin && !doc.visibleToClient && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </Badge>
                </>
              )}
            </div>
            {doc.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{doc.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </Button>

          {(isAdmin || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem onClick={handleToggleVisibility}>
                    {doc.visibleToClient ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide from client
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show to client
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{doc.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function DocumentList({ documents, projectId, isAdmin = false, groupByCategory = true }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No documents yet</p>
      </div>
    );
  }

  if (!groupByCategory) {
    return (
      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentItem key={doc.id} doc={doc} projectId={projectId} isAdmin={isAdmin} />
        ))}
      </div>
    );
  }

  // Group by category
  const grouped = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, ProjectDocument[]>);

  const categoryOrder: DocumentCategory[] = [
    'formation',
    'tax',
    'branding',
    'contracts',
    'compliance',
    'other',
    'client_uploads',
  ];

  return (
    <div className="space-y-6">
      {categoryOrder.map((category) => {
        const docs = grouped[category];
        if (!docs?.length) return null;

        return (
          <div key={category}>
            <h4 className="text-sm font-medium mb-2">{CATEGORY_LABELS[category]}</h4>
            <div className="space-y-2">
              {docs.map((doc) => (
                <DocumentItem key={doc.id} doc={doc} projectId={projectId} isAdmin={isAdmin} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
