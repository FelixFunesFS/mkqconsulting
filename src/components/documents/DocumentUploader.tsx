import { useCallback, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUploadDocument } from '@/hooks/useDocuments';
import { DocumentCategory, CATEGORY_LABELS, ADMIN_CATEGORIES, CLIENT_UPLOAD_CATEGORY } from '@/types/document';

interface DocumentUploaderProps {
  projectId: string;
  isAdmin?: boolean;
  onSuccess?: () => void;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export function DocumentUploader({ projectId, isAdmin = false, onSuccess }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>(isAdmin ? 'other' : CLIENT_UPLOAD_CATEGORY);
  const [description, setDescription] = useState('');
  const [visibleToClient, setVisibleToClient] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = useUploadDocument();

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return 'File type not allowed. Please upload PDF, images, or Office documents.';
    }
    if (f.size > MAX_SIZE) {
      return 'File too large. Maximum size is 20MB.';
    }
    return null;
  };

  const handleFileSelect = (f: File) => {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    await uploadDocument.mutateAsync({
      projectId,
      file,
      category,
      description: description || undefined,
      visibleToClient,
    });

    // Reset form
    setFile(null);
    setDescription('');
    setVisibleToClient(true);
    onSuccess?.();
  };

  const categories = isAdmin ? ADMIN_CATEGORIES : [CLIENT_UPLOAD_CATEGORY];

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}
          ${file ? 'bg-muted/50' : ''}
        `}
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <label className="cursor-pointer">
                <span className="text-primary hover:underline">Choose a file</span>
                <Input
                  type="file"
                  className="hidden"
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
              </label>
              <span className="text-muted-foreground"> or drag and drop</span>
            </div>
            <p className="text-xs text-muted-foreground">
              PDF, Images, Word, Excel (max 20MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {file && (
        <>
          {/* Category selector (admin only sees multiple options) */}
          {isAdmin && categories.length > 1 && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={2}
            />
          </div>

          {/* Visibility toggle (admin only) */}
          {isAdmin && (
            <div className="flex items-center justify-between">
              <Label>Visible to client</Label>
              <Switch
                checked={visibleToClient}
                onCheckedChange={setVisibleToClient}
              />
            </div>
          )}

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={uploadDocument.isPending}
            className="w-full"
          >
            {uploadDocument.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
