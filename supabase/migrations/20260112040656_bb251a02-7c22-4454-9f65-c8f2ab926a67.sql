-- Fix overly permissive RLS policy on task_templates table
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Allow all access to task_templates" ON public.task_templates;

-- Create more restrictive policies:
-- 1. Admins can manage all templates
CREATE POLICY "Admins can manage all task templates" 
ON public.task_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Authenticated users can only view active templates (read-only)
CREATE POLICY "Authenticated users can view active task templates" 
ON public.task_templates 
FOR SELECT 
USING (is_active = true);