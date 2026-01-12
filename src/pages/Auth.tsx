import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, CheckCircle2, Shield } from 'lucide-react';
import mkgLogo from '@/assets/mkg-logo.png';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, isClient, loading: roleLoading } = useUserRole();
  const isMobile = useIsMobile();

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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Brand Panel - Desktop Only */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 
                      bg-gradient-to-br from-[#1A0A2E] via-[#2D1B4E] to-[#1A0A2E] 
                      relative overflow-hidden">
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 w-full h-1" 
             style={{ backgroundColor: '#DFFF00' }} />
        
        {/* Decorative elements - subtle geometric shapes */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 
                        rounded-full bg-[#DFFF00]/5 blur-3xl" />
        <div className="absolute -top-20 -left-20 w-64 h-64 
                        rounded-full bg-[#DFFF00]/10 blur-2xl" />
        <div className="absolute top-1/4 right-10 w-32 h-32 
                        rounded-full bg-[#DFFF00]/5 blur-xl" />
        
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Logo - larger on desktop */}
          <img 
            src={mkgLogo} 
            alt="MKG Consulting" 
            className="h-28 w-auto object-contain mx-auto mb-8 rounded-xl shadow-lg shadow-black/20" 
          />
          
          {/* Tagline */}
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Where Vision Meets Execution
          </h1>
          <p className="text-white/60 text-lg mb-12">
            Your trusted partner in web development and Marketing Solutions
          </p>
          
          {/* Value propositions */}
          <div className="flex flex-col gap-5 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#DFFF00]/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[#DFFF00]" />
              </div>
              <span className="text-white/90">Real-time project tracking & updates</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#DFFF00]/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[#DFFF00]" />
              </div>
              <span className="text-white/90">Secure document sharing & collaboration</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#DFFF00]/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[#DFFF00]" />
              </div>
              <span className="text-white/90">Direct communication with your team</span>
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1" 
             style={{ backgroundColor: '#DFFF00' }} />
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Top Banner - Mobile Only */}
        <div 
          className="h-2 shrink-0 md:hidden" 
          style={{ backgroundColor: '#DFFF00' }} 
        />
        
        {/* Main Content - Centered */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              {/* Logo and tagline - Mobile Only */}
              {isMobile && (
                <>
                  <img 
                    src={mkgLogo} 
                    alt="MKG Consulting" 
                    className="mx-auto mb-4 h-20 sm:h-24 w-auto object-contain rounded-xl shadow-lg shadow-black/20"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    Where Vision Meets Execution
                  </p>
                </>
              )}
              <CardTitle className="text-xl sm:text-2xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to access your project dashboard
              </CardDescription>
              
              {/* Value Bullets - Mobile Only */}
              {isMobile && (
                <div className="flex flex-col gap-2 mt-4 text-xs sm:text-sm text-muted-foreground text-left">
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
              )}
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
        </div>
        
        {/* Footer */}
        <div className="shrink-0 py-4 text-center text-xs text-muted-foreground space-y-2">
          <p>
            Need help? <a href="mailto:envision@mkqconsulting.com" className="text-primary hover:underline">Contact Support</a>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <span className="hidden sm:inline">|</span>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
        
        {/* Bottom Banner - Mobile Only */}
        <div 
          className="h-2 shrink-0 md:hidden" 
          style={{ backgroundColor: '#1A0A2E' }} 
        />
      </div>
    </div>
  );
}
