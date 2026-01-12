import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ClientSidebar } from '@/components/layout/ClientSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Building2, Save, ImageIcon, Bell } from 'lucide-react';
import { ClientLogoUploader } from '@/components/clients/ClientLogoUploader';
import { PushNotificationToggle } from '@/components/notifications/PushNotificationToggle';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20).optional(),
  companyName: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ClientAccount() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch client data
  const { data: clientData, isLoading } = useQuery({
    queryKey: ['client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      companyName: '',
      notes: ''
    }
  });

  // Reset form when client data loads
  useEffect(() => {
    if (clientData) {
      reset({
        fullName: clientData.name || '',
        phone: clientData.phone || '',
        companyName: clientData.company_name || '',
        notes: clientData.notes || ''
      });
    }
  }, [clientData, reset]);

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!clientData?.id) throw new Error('No client record found');
      
      const { error } = await supabase
        .from('clients')
        .update({
          name: data.fullName,
          phone: data.phone || null,
          company_name: data.companyName || null,
          notes: data.notes || null
        })
        .eq('id', clientData.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row bg-background">
        <ClientSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <ClientSidebar />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto md:mx-0">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Account Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile and contact information
            </p>
          </div>

          {/* Logo Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Brand Logo
              </CardTitle>
              <CardDescription>
                Upload your company logo to personalize your portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientData && (
                <ClientLogoUploader
                  clientId={clientData.id}
                  currentLogoUrl={clientData.logo_url}
                  clientName={clientData.name}
                  size="lg"
                />
              )}
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || clientData?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Your company or business name"
                    {...register('companyName')}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information you'd like us to know..."
                    rows={3}
                    {...register('notes')}
                  />
                  {errors.notes && (
                    <p className="text-sm text-destructive">{errors.notes.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={updateProfile.isPending || !isDirty}
                  className="w-full sm:w-auto"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive project updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PushNotificationToggle />
              <p className="text-sm text-muted-foreground">
                Get instant alerts when your project is updated, even when the app is closed.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
