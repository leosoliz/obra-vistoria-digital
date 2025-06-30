
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VistoriasList from "./pages/VistoriasList";
import VistoriaView from "./pages/VistoriaView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para proteger rotas autenticadas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Componente para redirecionar usuários autenticados
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (user) {
    return <Navigate to="/vistorias" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      <Route path="/vistorias" element={
        <ProtectedRoute>
          <VistoriasList />
        </ProtectedRoute>
      } />
      <Route path="/vistoria/:id" element={
        <ProtectedRoute>
          <VistoriaView />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
