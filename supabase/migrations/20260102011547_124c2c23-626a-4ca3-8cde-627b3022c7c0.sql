-- Add logo_url column to clients table
ALTER TABLE public.clients
ADD COLUMN logo_url text;

-- Create storage bucket for client logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true);

-- RLS Policies for client-logos bucket

-- Anyone can view logos (public bucket)
CREATE POLICY "Public can view client logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-logos');

-- Admins can upload/update logos for any client
CREATE POLICY "Admins can upload client logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update client logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'client-logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete client logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'client-logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Clients can upload/update their own logo
CREATE POLICY "Clients can upload their own logo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-logos'
  AND (storage.foldername(name))[1] = get_client_id_for_user(auth.uid())::text
);

CREATE POLICY "Clients can update their own logo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'client-logos'
  AND (storage.foldername(name))[1] = get_client_id_for_user(auth.uid())::text
);

CREATE POLICY "Clients can delete their own logo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'client-logos'
  AND (storage.foldername(name))[1] = get_client_id_for_user(auth.uid())::text
);