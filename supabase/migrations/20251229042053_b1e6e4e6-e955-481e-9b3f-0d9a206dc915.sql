-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-documents', 'project-documents', false);

-- Create document category enum
CREATE TYPE public.document_category AS ENUM (
  'formation',
  'tax',
  'branding',
  'contracts',
  'compliance',
  'client_uploads',
  'other'
);

-- Create project_documents table
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  category document_category NOT NULL DEFAULT 'other',
  description TEXT,
  visible_to_client BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_documents
CREATE POLICY "Admins can manage all documents"
ON public.project_documents
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view visible documents for their projects"
ON public.project_documents
FOR SELECT
USING (
  visible_to_client = true 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_documents.project_id 
    AND projects.client_id = get_client_id_for_user(auth.uid())
  )
);

CREATE POLICY "Clients can upload documents to their projects"
ON public.project_documents
FOR INSERT
WITH CHECK (
  category = 'client_uploads'
  AND uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_documents.project_id 
    AND projects.client_id = get_client_id_for_user(auth.uid())
  )
);

CREATE POLICY "Clients can delete their own uploads"
ON public.project_documents
FOR DELETE
USING (
  category = 'client_uploads'
  AND uploaded_by = auth.uid()
);

-- Trigger for updated_at
CREATE TRIGGER update_project_documents_updated_at
BEFORE UPDATE ON public.project_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for project-documents bucket
CREATE POLICY "Admins can manage all files"
ON storage.objects
FOR ALL
USING (bucket_id = 'project-documents' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view files for their projects"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-documents' 
  AND EXISTS (
    SELECT 1 FROM project_documents pd
    JOIN projects p ON p.id = pd.project_id
    WHERE pd.file_path = name
    AND pd.visible_to_client = true
    AND p.client_id = get_client_id_for_user(auth.uid())
  )
);

CREATE POLICY "Clients can upload files to their projects"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'project-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM projects p 
    WHERE p.client_id = get_client_id_for_user(auth.uid())
  )
  AND (storage.foldername(name))[2] = 'client_uploads'
);

CREATE POLICY "Clients can delete their uploaded files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-documents'
  AND (storage.foldername(name))[2] = 'client_uploads'
  AND EXISTS (
    SELECT 1 FROM project_documents pd
    WHERE pd.file_path = name
    AND pd.uploaded_by = auth.uid()
  )
);