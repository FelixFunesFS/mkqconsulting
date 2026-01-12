import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Shield } from 'lucide-react';
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
          <p className="text-sm text-muted-foreground mb-2">
            Your Strategic Partner in Project Success
          </p>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in to access your project dashboard
          </CardDescription>
          
          {/* Value Bullets */}
          <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground text-left">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Real-time project tracking & updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Secure document sharing & collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Direct communication with your team</span>
            </div>
          </div>
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
          
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-green-500" />
            <span>256-bit SSL encrypted | Your data is secure</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="fixed bottom-6 left-0 right-0 text-center text-xs text-muted-foreground space-y-2">
        <p>
          Need help? <a href="mailto:envision@mkqconsulting.com" className="text-primary hover:underline">Contact Support</a>
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>|</span>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
