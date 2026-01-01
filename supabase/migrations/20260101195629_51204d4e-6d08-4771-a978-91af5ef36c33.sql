-- Create enum for client task categories
CREATE TYPE public.client_task_category AS ENUM (
  'access',
  'approvals', 
  'content',
  'assets',
  'messaging',
  'incentives',
  'seo',
  'other'
);

-- Create enum for client task status
CREATE TYPE public.client_task_status AS ENUM (
  'pending',
  'completed',
  'not_applicable'
);

-- Create client_task_templates table
CREATE TABLE public.client_task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_set TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category client_task_category NOT NULL DEFAULT 'other',
  priority task_priority NOT NULL DEFAULT 'medium',
  why_needed TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_tasks table
CREATE TABLE public.client_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category client_task_category NOT NULL DEFAULT 'other',
  priority task_priority NOT NULL DEFAULT 'medium',
  status client_task_status NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  client_notes TEXT,
  admin_notes TEXT,
  why_needed TEXT,
  due_date DATE,
  display_order INTEGER DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual',
  visible_to_client BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.client_task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_task_templates (admin only for management, all authenticated can read active)
CREATE POLICY "Admins can manage all client task templates"
ON public.client_task_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active templates"
ON public.client_task_templates
FOR SELECT
USING (is_active = true);

-- RLS policies for client_tasks
CREATE POLICY "Admins can manage all client tasks"
ON public.client_tasks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view visible tasks for their projects"
ON public.client_tasks
FOR SELECT
USING (
  visible_to_client = true 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = client_tasks.project_id 
    AND projects.client_id = get_client_id_for_user(auth.uid())
  )
);

CREATE POLICY "Clients can update their project tasks"
ON public.client_tasks
FOR UPDATE
USING (
  visible_to_client = true 
  AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = client_tasks.project_id 
    AND projects.client_id = get_client_id_for_user(auth.uid())
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_client_tasks_updated_at
BEFORE UPDATE ON public.client_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for client_tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_tasks;

-- Pre-populate Month 1 Onboarding templates
INSERT INTO public.client_task_templates (template_set, name, description, category, priority, why_needed, display_order) VALUES
-- Access (Priority)
('month_1_onboarding', 'PunchPass Admin Access', 'Provide admin access to your PunchPass account', 'access', 'critical', 'Required to optimize packages, control pricing visibility, and embed Reset Week checkout on the website.', 1),
('month_1_onboarding', 'Website Platform Access', 'Provide CMS access with publish rights', 'access', 'critical', 'Needed to finalize and publish January conversion messaging.', 2),
('month_1_onboarding', 'Facebook & Meta Access', 'Provide Facebook Page Admin, Meta Business Manager, and Messenger inbox access', 'access', 'critical', 'Enables January ads, events, DM replies, and comment responses.', 3),
('month_1_onboarding', 'Google Business Profile Admin Access', 'Provide admin access to your Google Business Profile', 'access', 'critical', 'Required for January local SEO updates and weekly posts.', 4),
-- Approvals
('month_1_onboarding', 'Approve Final Website Updates', 'Review and approve hero headline, subheadline, primary CTA, and pricing section', 'approvals', 'high', 'January visitors need clarity and reassurance, not hype.', 5),
('month_1_onboarding', 'Confirm Package Names & Pricing', 'Confirm Movement Reset Week ($49), Foundation Membership, Longevity Unlimited pricing', 'approvals', 'high', 'Protects brand value when competitors are discounting heavily.', 6),
-- SEO
('month_1_onboarding', 'Confirm Neighborhoods to Emphasize', 'Specify which neighborhoods/areas to target (e.g., Avondale / West Ashley)', 'seo', 'medium', 'January local search volume spikes — accuracy matters.', 7),
('month_1_onboarding', 'Confirm Address & Phone Number', 'Verify your business address and phone number are correct', 'seo', 'medium', 'Ensures accurate local SEO and customer contact.', 8),
-- Messaging
('month_1_onboarding', 'Messaging Input - Beginners', 'Answer: Is this good for beginners or people restarting?', 'messaging', 'high', 'January prospects are hesitant — calm, confident responses matter.', 9),
('month_1_onboarding', 'Messaging Input - Past Gym Experience', 'Answer: What if I''ve tried gyms before and it didn''t stick?', 'messaging', 'high', 'Addresses common concerns from resolution-burned prospects.', 10),
('month_1_onboarding', 'Messaging Input - Getting Started', 'Answer: How do I start safely?', 'messaging', 'high', 'Provides reassurance for hesitant new clients.', 11),
('month_1_onboarding', 'Approve Auto-Response', 'Approve simple auto-response for comments/messages', 'messaging', 'medium', 'Prevents missed leads during high January activity.', 12),
-- Assets
('month_1_onboarding', 'Prior Client List', 'Share list of prior members/clients (Name + email, phone if available)', 'assets', 'medium', 'February re-engagement opportunity once resolution churn begins.', 13),
-- Incentives
('month_1_onboarding', 'Approve Incentive Structure', 'Confirm 50% off first month, offered only after Reset Week, valid 7 days, verbal/private only', 'incentives', 'high', 'Keeps positioning as the smart alternative in January.', 14);