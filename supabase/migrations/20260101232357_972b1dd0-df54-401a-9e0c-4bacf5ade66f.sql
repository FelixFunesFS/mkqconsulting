-- Drop broken policies
DROP POLICY IF EXISTS "Clients can view files for their projects" ON storage.objects;
DROP POLICY IF EXISTS "Clients can delete their uploaded files" ON storage.objects;

-- Recreate SELECT policy with correct comparison
CREATE POLICY "Clients can view files for their projects"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-documents' 
  AND EXISTS (
    SELECT 1 FROM public.project_documents pd
    JOIN public.projects p ON p.id = pd.project_id
    WHERE name = pd.file_path
    AND pd.visible_to_client = true
    AND p.client_id = get_client_id_for_user(auth.uid())
  )
);

-- Recreate DELETE policy with correct comparison
CREATE POLICY "Clients can delete their uploaded files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-documents'
  AND (storage.foldername(name))[2] = 'client_uploads'
  AND EXISTS (
    SELECT 1 FROM public.project_documents pd
    WHERE name = pd.file_path
    AND pd.uploaded_by = auth.uid()
  )
);