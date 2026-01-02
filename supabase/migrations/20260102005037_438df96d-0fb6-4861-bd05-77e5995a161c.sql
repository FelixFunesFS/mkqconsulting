-- Create enum for revenue type
CREATE TYPE public.revenue_type AS ENUM ('monthly', 'one_time');

-- Create project_revenues table
CREATE TABLE public.project_revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type revenue_type NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT,
  start_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_revenues ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all revenues"
ON public.project_revenues
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view revenues for their projects"
ON public.project_revenues
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = project_revenues.project_id
    AND projects.client_id = get_client_id_for_user(auth.uid())
));

-- Create index for faster lookups
CREATE INDEX idx_project_revenues_project_id ON public.project_revenues(project_id);

-- Function to sync monthly_revenue on projects table
CREATE OR REPLACE FUNCTION public.sync_project_monthly_revenue()
RETURNS TRIGGER AS $$
DECLARE
  target_project_id uuid;
  total_monthly numeric;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_project_id := OLD.project_id;
  ELSE
    target_project_id := NEW.project_id;
  END IF;

  SELECT COALESCE(SUM(amount), 0)
  INTO total_monthly
  FROM project_revenues
  WHERE project_id = target_project_id
    AND type = 'monthly'
    AND is_active = true;

  UPDATE projects
  SET monthly_revenue = total_monthly
  WHERE id = target_project_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sync_monthly_revenue ON project_revenues;
CREATE TRIGGER trigger_sync_monthly_revenue
AFTER INSERT OR UPDATE OR DELETE ON project_revenues
FOR EACH ROW
EXECUTE FUNCTION sync_project_monthly_revenue();

-- Migrate existing monthly_revenue data
INSERT INTO project_revenues (project_id, type, amount, description, is_active)
SELECT id, 'monthly', monthly_revenue, 'Hosting', true
FROM projects
WHERE monthly_revenue IS NOT NULL AND monthly_revenue > 0;