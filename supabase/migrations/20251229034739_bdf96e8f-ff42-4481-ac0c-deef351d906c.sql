-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create profiles table for all authenticated users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create clients table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  company_name text,
  phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Add client_id to projects table
ALTER TABLE public.projects ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create has_role security definer function (prevents infinite recursion in RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get client_id for a user
CREATE OR REPLACE FUNCTION public.get_client_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.clients WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Clients RLS policies
CREATE POLICY "Admins can manage all clients"
ON public.clients FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own record"
ON public.clients FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Clients can update their own record"
ON public.clients FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Update projects RLS policy to allow client access
DROP POLICY IF EXISTS "Allow all access to projects" ON public.projects;

CREATE POLICY "Admins can manage all projects"
ON public.projects FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own projects"
ON public.projects FOR SELECT
TO authenticated
USING (client_id = public.get_client_id_for_user(auth.uid()));

-- Update questionnaires RLS policy
DROP POLICY IF EXISTS "Allow all access to questionnaires" ON public.questionnaires;

CREATE POLICY "Admins can manage all questionnaires"
ON public.questionnaires FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their project questionnaires"
ON public.questionnaires FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = questionnaires.project_id
    AND projects.client_id = public.get_client_id_for_user(auth.uid())
  )
);

CREATE POLICY "Clients can update their project questionnaires"
ON public.questionnaires FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = questionnaires.project_id
    AND projects.client_id = public.get_client_id_for_user(auth.uid())
  )
);

-- Update tasks RLS policy
DROP POLICY IF EXISTS "Allow all access to tasks" ON public.tasks;

CREATE POLICY "Admins can manage all tasks"
ON public.tasks FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their project tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = tasks.project_id
    AND projects.client_id = public.get_client_id_for_user(auth.uid())
  )
);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Check if this email exists in clients table and link the user
  UPDATE public.clients
  SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;
  
  -- If user was linked to a client, give them client role, otherwise they start with no role
  IF EXISTS (SELECT 1 FROM public.clients WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();