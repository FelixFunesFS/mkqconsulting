-- Create comments table for project/task discussions
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  visible_to_client BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Admins can manage all comments
CREATE POLICY "Admins can manage all comments"
ON public.comments
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Clients can view visible comments for their projects
CREATE POLICY "Clients can view visible comments for their projects"
ON public.comments
FOR SELECT
USING (
  visible_to_client = true 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = comments.project_id 
    AND projects.client_id = get_client_id_for_user(auth.uid())
  )
);

-- Clients can create comments on their projects
CREATE POLICY "Clients can create comments on their projects"
ON public.comments
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND visible_to_client = true
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = comments.project_id 
    AND projects.client_id = get_client_id_for_user(auth.uid())
  )
);

-- Clients can update their own comments
CREATE POLICY "Clients can update their own comments"
ON public.comments
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Clients can delete their own comments
CREATE POLICY "Clients can delete their own comments"
ON public.comments
FOR DELETE
USING (user_id = auth.uid());

-- Create indexes for faster queries
CREATE INDEX idx_comments_project_id ON public.comments(project_id);
CREATE INDEX idx_comments_task_id ON public.comments(task_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();