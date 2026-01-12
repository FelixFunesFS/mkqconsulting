import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Install from "./pages/Install";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminSettings from "./pages/admin/AdminSettings";

// Client Portal Pages
import ClientDashboard from "./pages/portal/ClientDashboard";
import ClientProject from "./pages/portal/ClientProject";
import ClientQuestionnaire from "./pages/portal/ClientQuestionnaire";
import ClientAccount from "./pages/portal/ClientAccount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/install" element={<Install />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute requiredRole="admin">
                <AdminClients />
              </ProtectedRoute>
            } />
            <Route path="/admin/projects" element={
              <ProtectedRoute requiredRole="admin">
                <AdminProjects />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            } />

            {/* Client Portal Routes */}
            <Route path="/portal" element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/portal/projects" element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/portal/project/:id" element={
              <ProtectedRoute requiredRole="client">
                <ClientProject />
              </ProtectedRoute>
            } />
            <Route path="/portal/questionnaire/:id" element={
              <ProtectedRoute requiredRole="client">
                <ClientQuestionnaire />
              </ProtectedRoute>
            } />
            <Route path="/portal/account" element={
              <ProtectedRoute requiredRole="client">
                <ClientAccount />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
