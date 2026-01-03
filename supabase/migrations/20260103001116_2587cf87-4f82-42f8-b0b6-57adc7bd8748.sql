-- Create admin_settings table for persistent settings
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_notifications boolean NOT NULL DEFAULT true,
  client_activity_alerts boolean NOT NULL DEFAULT true,
  auto_send_invitations boolean NOT NULL DEFAULT false,
  show_task_details boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage their own settings
CREATE POLICY "Users can view their own settings"
ON public.admin_settings
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
ON public.admin_settings
FOR UPDATE
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();