import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading, isAdmin, isClient } = useUserRole();
  const location = useLocation();

  const loading = authLoading || (isAuthenticated && roleLoading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If a specific role is required, check for it
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to appropriate portal based on role
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    if (isClient) {
      return <Navigate to="/portal" replace />;
    }
    // No role assigned - redirect to pending page or auth
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
