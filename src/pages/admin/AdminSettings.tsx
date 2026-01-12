import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/useAdminSettings';
import { useToast } from '@/hooks/use-toast';
import { Settings, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const { toast } = useToast();

  const handleSettingChange = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({ [key]: value });
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your application preferences
            </p>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <SettingSkeleton />
                    <SettingSkeleton />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about project changes
                        </p>
                      </div>
                      <Switch 
                        checked={settings?.emailNotifications ?? true}
                        onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                        disabled={updateSettings.isPending}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Client activity</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when clients update questionnaires
                        </p>
                      </div>
                      <Switch 
                        checked={settings?.clientActivityAlerts ?? true}
                        onCheckedChange={(checked) => handleSettingChange('clientActivityAlerts', checked)}
                        disabled={updateSettings.isPending}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Portal</CardTitle>
                <CardDescription>
                  Configure client-facing settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    <SettingSkeleton />
                    <SettingSkeleton />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-send invitations</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically send portal invitations when creating clients
                        </p>
                      </div>
                      <Switch 
                        checked={settings?.autoSendInvitations ?? false}
                        onCheckedChange={(checked) => handleSettingChange('autoSendInvitations', checked)}
                        disabled={updateSettings.isPending}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show task details</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow clients to see detailed task information
                        </p>
                      </div>
                      <Switch 
                        checked={settings?.showTaskDetails ?? false}
                        onCheckedChange={(checked) => handleSettingChange('showTaskDetails', checked)}
                        disabled={updateSettings.isPending}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-11 rounded-full" />
    </div>
  );
}
