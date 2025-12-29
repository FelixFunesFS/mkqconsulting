import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'client';

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data.map(r => r.role as AppRole);
    },
    enabled: !!user?.id
  });

  const isAdmin = roles?.includes('admin') ?? false;
  const isClient = roles?.includes('client') ?? false;
  const loading = authLoading || rolesLoading;

  return {
    roles: roles ?? [],
    isAdmin,
    isClient,
    loading,
    hasRole: (role: AppRole) => roles?.includes(role) ?? false
  };
}
