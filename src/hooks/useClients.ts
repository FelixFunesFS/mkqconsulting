import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  userId: string | null;
  email: string;
  name: string;
  companyName: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapDbToClient(row: any): Client {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    companyName: row.company_name,
    phone: row.phone,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbToClient);
    }
  });
}

export function useClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      
      if (error) throw error;
      return data ? mapDbToClient(data) : null;
    },
    enabled: !!clientId
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (client: { 
      email: string; 
      name: string; 
      companyName?: string; 
      phone?: string; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          email: client.email,
          name: client.name,
          company_name: client.companyName,
          phone: client.phone,
          notes: client.notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToClient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: { 
      id: string; 
      email?: string; 
      name?: string; 
      companyName?: string; 
      phone?: string; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          email: updates.email,
          name: updates.name,
          company_name: updates.companyName,
          phone: updates.phone,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToClient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });
}

