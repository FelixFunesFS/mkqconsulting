-- Fix the storage policy that incorrectly compares pd.file_path to pd.name
-- The correct comparison should be storage.objects.name to pd.file_path

-- First drop the broken policy
DROP POLICY IF EXISTS "Clients can view files for their projects" ON storage.objects;

-- Recreate with correct comparison
CREATE POLICY "Clients can view files for their projects"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-documents' 
  AND EXISTS (
    SELECT 1 FROM public.project_documents pd
    JOIN public.projects p ON p.id = pd.project_id
    WHERE pd.file_path = name
    AND pd.visible_to_client = true
    AND p.client_id = public.get_client_id_for_user(auth.uid())
  )
);