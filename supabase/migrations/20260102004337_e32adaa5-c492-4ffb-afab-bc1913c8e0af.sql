-- Function to recalculate project task statistics
CREATE OR REPLACE FUNCTION update_project_task_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_project_id uuid;
  completed_count integer;
  total_count integer;
  progress_pct integer;
BEGIN
  -- Determine which project to update
  IF TG_OP = 'DELETE' THEN
    target_project_id := OLD.project_id;
  ELSE
    target_project_id := NEW.project_id;
  END IF;

  -- Calculate actual counts from tasks table
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*)
  INTO completed_count, total_count
  FROM tasks
  WHERE project_id = target_project_id;

  -- Calculate progress percentage
  IF total_count > 0 THEN
    progress_pct := ROUND((completed_count::numeric / total_count::numeric) * 100);
  ELSE
    progress_pct := 0;
  END IF;

  -- Update the project
  UPDATE projects
  SET 
    tasks_completed = completed_count,
    total_tasks = total_count,
    progress = progress_pct
  WHERE id = target_project_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on tasks table
DROP TRIGGER IF EXISTS trigger_update_project_stats ON tasks;
CREATE TRIGGER trigger_update_project_stats
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_project_task_stats();

-- Sync all existing project statistics
UPDATE projects p
SET 
  tasks_completed = COALESCE(stats.completed, 0),
  total_tasks = COALESCE(stats.total, 0),
  progress = CASE 
    WHEN COALESCE(stats.total, 0) > 0 THEN ROUND((stats.completed::numeric / stats.total::numeric) * 100)
    ELSE 0 
  END
FROM (
  SELECT 
    project_id,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) as total
  FROM tasks
  GROUP BY project_id
) stats
WHERE p.id = stats.project_id;