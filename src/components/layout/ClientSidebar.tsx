import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  FolderKanban, 
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/portal' },
  { id: 'projects', label: 'My Projects', icon: FolderKanban, path: '/portal/projects' },
  { id: 'account', label: 'Account', icon: User, path: '/portal/account' },
];

export function ClientSidebar() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  // Fetch client data for logo
  const { data: clientData } = useQuery({
    queryKey: ['client-sidebar-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, company_name, logo_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const logoUrl = clientData?.logo_url;
  const clientName = clientData?.name || clientData?.company_name || 'Client';
  const clientInitial = clientName.charAt(0).toUpperCase();

  // Update collapsed state on resize for tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const wasAuthenticated = useRef(false);

  // Redirect to auth when user signs out
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      wasAuthenticated.current = true;
    }
    if (!authLoading && !isAuthenticated && wasAuthenticated.current) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    // Navigation handled by isAuthenticated effect
  };

  const isActive = (path: string) => {
    if (path === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSheetOpen(false);
  };

  const NavigationContent = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
    <>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">Theme</span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  // Mobile: Header bar with sheet drawer
  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] h-[calc(3.5rem+max(0.75rem,env(safe-area-inset-top)))]">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={logoUrl || undefined} alt={clientName} />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                      {clientInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground truncate max-w-[140px]">{clientName}</span>
                </div>
              </div>
              <NavigationContent onNavigate={handleNavigation} />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={logoUrl || undefined} alt={clientName} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {clientInitial}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground truncate max-w-[140px]">{clientName}</span>
          </div>
          
          <div className="w-9" /> {/* Spacer for centering */}
        </header>
        {/* Spacer for fixed header */}
        <div className="shrink-0 h-[calc(3.5rem+max(0.75rem,env(safe-area-inset-top)))]" />
      </>
    );
  }

  // Desktop: Collapsible sidebar
  return (
    <aside 
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={logoUrl || undefined} alt={clientName} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {clientInitial}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground truncate max-w-[140px]">{clientName}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2",
          collapsed && "justify-center px-2"
        )}>
          <ThemeToggle />
          {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
        </div>
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
