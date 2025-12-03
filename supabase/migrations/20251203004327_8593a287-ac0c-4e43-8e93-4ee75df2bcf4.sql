-- Create project status enum
CREATE TYPE public.project_status AS ENUM ('discovery', 'design', 'development', 'review', 'published');

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  website_url TEXT,
  status project_status NOT NULL DEFAULT 'discovery',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL DEFAULT 20,
  start_date DATE,
  target_launch_date DATE,
  monthly_revenue DECIMAL(10,2),
  hosting_provider TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questionnaires table
CREATE TABLE public.questionnaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  company_name TEXT,
  industry TEXT,
  years_in_business TEXT,
  mission_statement TEXT,
  brand_colors TEXT,
  existing_logo BOOLEAN DEFAULT false,
  brand_guidelines TEXT,
  target_demographics TEXT,
  geographic_reach TEXT,
  customer_pain_points TEXT,
  competitors TEXT,
  main_products_services TEXT,
  unique_selling_points TEXT,
  pricing_display TEXT,
  primary_goals TEXT[],
  required_features TEXT[],
  calls_to_action TEXT,
  content_ready BOOLEAN DEFAULT false,
  content_sections TEXT,
  image_sources TEXT,
  target_keywords TEXT,
  google_analytics BOOLEAN DEFAULT false,
  social_media_links TEXT,
  privacy_policy_needed BOOLEAN DEFAULT true,
  terms_needed BOOLEAN DEFAULT true,
  accessibility_requirements TEXT,
  design_style TEXT,
  example_websites TEXT,
  color_preferences TEXT,
  domain_status TEXT,
  hosting_preference TEXT,
  maintenance_plan TEXT,
  timeline TEXT,
  budget_range TEXT,
  decision_makers TEXT,
  assumptions TEXT,
  limitations TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;

-- For now, create public read/write policies (we'll add auth later)
CREATE POLICY "Allow all access to projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to questionnaires" ON public.questionnaires FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questionnaires_updated_at
  BEFORE UPDATE ON public.questionnaires
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed your real projects
INSERT INTO public.projects (client_name, business_name, website_url, status, progress, tasks_completed, total_tasks, monthly_revenue, hosting_provider, start_date) VALUES
-- Published projects
('Gale J. Fort', 'Benefits Beyond the VA Wall', NULL, 'published', 100, 20, 20, 49.00, 'Lovable', '2024-06-01'),
('Dominick Ward', 'Soul Train''s Eatery', NULL, 'published', 100, 20, 20, 49.00, 'Lovable', '2024-07-01'),
('Self', 'Discover El Salvador', NULL, 'published', 100, 20, 20, 0, 'Lovable', '2024-08-01'),
-- In development projects
('Helen Harris', 'Visions of Hope', NULL, 'development', 40, 8, 20, NULL, NULL, '2024-11-01'),
('Helen Harris', 'The Village House', NULL, 'design', 25, 5, 20, NULL, NULL, '2024-11-10'),
('David Drake', 'Drake Fitness', NULL, 'discovery', 15, 3, 20, NULL, NULL, '2024-11-15'),
('Dominick Ward', 'Souls Feeding Souls', NULL, 'development', 50, 10, 20, NULL, NULL, '2024-10-20');