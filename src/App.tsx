import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { AppFooter } from "@/components/AppFooter";
import AgentGallery from "@/pages/AgentGallery";
import Dashboard from "@/pages/Dashboard";
import RunBakeoff from "@/pages/RunBakeoff";
import Results from "@/pages/Results";
import Pipeline from "@/pages/Pipeline";
import AuthPage from "@/pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader onSignOut={signOut} userEmail={user.email} />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<AgentGallery />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/run" element={<RunBakeoff />} />
            <Route path="/results" element={<Results />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <AppFooter />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
