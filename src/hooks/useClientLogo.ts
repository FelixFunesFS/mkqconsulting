import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'client-logos';

export function useUploadClientLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, file }: { clientId: string; file: File }) => {
      // Get file extension
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const filePath = `${clientId}/logo.${ext}`;

      // Delete any existing logo files for this client first
      const { data: existingFiles } = await supabase.storage
        .from(BUCKET_NAME)
        .list(clientId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${clientId}/${f.name}`);
        await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL with cache-busting timestamp
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const logoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update client record with new logo URL
      const { error: updateError } = await supabase
        .from('clients')
        .update({ logo_url: logoUrl })
        .eq('id', clientId);

      if (updateError) throw updateError;

      return logoUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-profile'] });
    }
  });
}

export function useDeleteClientLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      // List and delete all files in client folder
      const { data: existingFiles } = await supabase.storage
        .from(BUCKET_NAME)
        .list(clientId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${clientId}/${f.name}`);
        await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
      }

      // Update client record to remove logo URL
      const { error: updateError } = await supabase
        .from('clients')
        .update({ logo_url: null })
        .eq('id', clientId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-profile'] });
    }
  });
}
