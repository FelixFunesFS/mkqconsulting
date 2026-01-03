import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AdminSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  clientActivityAlerts: boolean;
  autoSendInvitations: boolean;
  showTaskDetails: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminSettingsRow {
  id: string;
  user_id: string;
  email_notifications: boolean;
  client_activity_alerts: boolean;
  auto_send_invitations: boolean;
  show_task_details: boolean;
  created_at: string;
  updated_at: string;
}

const mapDbToSettings = (row: AdminSettingsRow): AdminSettings => ({
  id: row.id,
  userId: row.user_id,
  emailNotifications: row.email_notifications,
  clientActivityAlerts: row.client_activity_alerts,
  autoSendInvitations: row.auto_send_invitations,
  showTaskDetails: row.show_task_details,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const DEFAULT_SETTINGS: Omit<AdminSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  emailNotifications: true,
  clientActivityAlerts: true,
  autoSendInvitations: false,
  showTaskDetails: false,
};

export function useAdminSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin_settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no settings exist, return defaults
      if (!data) {
        return {
          ...DEFAULT_SETTINGS,
          id: '',
          userId: user.id,
          createdAt: '',
          updatedAt: '',
        } as AdminSettings;
      }

      return mapDbToSettings(data as AdminSettingsRow);
    },
    enabled: !!user?.id,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settings: Partial<Omit<AdminSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const updateData: Record<string, any> = {};
      
      if (settings.emailNotifications !== undefined) {
        updateData.email_notifications = settings.emailNotifications;
      }
      if (settings.clientActivityAlerts !== undefined) {
        updateData.client_activity_alerts = settings.clientActivityAlerts;
      }
      if (settings.autoSendInvitations !== undefined) {
        updateData.auto_send_invitations = settings.autoSendInvitations;
      }
      if (settings.showTaskDetails !== undefined) {
        updateData.show_task_details = settings.showTaskDetails;
      }

      // Try to update first
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('admin_settings')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return mapDbToSettings(data as AdminSettingsRow);
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('admin_settings')
          .insert({
            user_id: user.id,
            ...updateData,
          })
          .select()
          .single();

        if (error) throw error;
        return mapDbToSettings(data as AdminSettingsRow);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_settings'] });
    },
  });
}
