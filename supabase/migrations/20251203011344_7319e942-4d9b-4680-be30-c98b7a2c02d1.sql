-- Create enum for task status
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');

-- Create enum for task priority
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for task source
CREATE TYPE task_source AS ENUM ('ai_generated', 'manual', 'template');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL DEFAULT 'discovery',
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  estimated_hours NUMERIC,
  due_date DATE,
  assigned_to TEXT,
  source task_source NOT NULL DEFAULT 'manual',
  questionnaire_field TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for all access (since no auth yet)
CREATE POLICY "Allow all access to tasks"
ON public.tasks
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_phase ON public.tasks(phase);