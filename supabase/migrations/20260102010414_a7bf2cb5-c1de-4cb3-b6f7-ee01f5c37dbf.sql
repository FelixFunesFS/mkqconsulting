-- Create revenue status enum
CREATE TYPE public.revenue_status AS ENUM ('active', 'pending', 'paused', 'cancelled');

-- Add status column to project_revenues
ALTER TABLE public.project_revenues 
ADD COLUMN status public.revenue_status NOT NULL DEFAULT 'active';

-- Migrate existing data based on is_active
UPDATE public.project_revenues 
SET status = CASE 
  WHEN is_active = true THEN 'active'::public.revenue_status
  ELSE 'paused'::public.revenue_status
END;

-- Update the sync trigger to only count active status
CREATE OR REPLACE FUNCTION public.sync_project_monthly_revenue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    AND status = 'active';

  UPDATE projects
  SET monthly_revenue = total_monthly
  WHERE id = target_project_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;