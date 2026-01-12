import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import mkgLogo from '@/assets/mkg-logo.png';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, isClient, loading: roleLoading } = useUserRole();

  // Redirect authenticated users to their portal
  // Wait for BOTH auth and role loading to complete before redirecting
  useEffect(() => {
    // Don't redirect until we know both auth state and user roles
    if (authLoading || roleLoading) {
      return;
    }
    
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (isClient) {
        navigate('/portal', { replace: true });
      }
      // If no role, they stay on auth page (could show a "pending approval" message)
    }
  }, [isAuthenticated, isAdmin, isClient, authLoading, roleLoading, navigate]);

  const handleLoginSuccess = () => {
    toast({
      title: 'Welcome back!',
      description: 'You have been signed in successfully.'
    });
  };

  const handleSignupSuccess = () => {
    toast({
      title: 'Account created!',
      description: 'Welcome! Your account has been created successfully.'
    });
  };

  const handleError = (error: string) => {
    toast({
      title: 'Error',
      description: error,
      variant: 'destructive'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4 relative">
      {/* Top Banner - Neon Yellow/Green */}
      <div 
        className="fixed top-0 left-0 right-0 h-2" 
        style={{ backgroundColor: '#DFFF00' }} 
      />
      
      {/* Bottom Banner - Deep Purple */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-2" 
        style={{ backgroundColor: '#1A0A2E' }} 
      />
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src={mkgLogo} 
            alt="MKG Consulting" 
            className="mx-auto mb-4 h-24 w-auto object-contain"
          />
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in to access your project dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSuccess={handleLoginSuccess} onError={handleError} />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm onSuccess={handleSignupSuccess} onError={handleError} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
