-- Create activity type enum
CREATE TYPE public.activity_type AS ENUM (
  'document_uploaded',
  'document_deleted',
  'task_created',
  'task_completed',
  'task_status_changed',
  'questionnaire_updated',
  'project_status_changed',
  'note_added'
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  visible_to_client BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Admins can manage all activities
CREATE POLICY "Admins can manage all activities"
ON public.activities
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Clients can view visible activities for their projects
CREATE POLICY "Clients can view visible activities for their projects"
ON public.activities
FOR SELECT
USING (
  visible_to_client = true 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = activities.project_id 
    AND projects.client_id = get_client_id_for_user(auth.uid())
  )
);

-- Create index for faster queries
CREATE INDEX idx_activities_project_id ON public.activities(project_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);