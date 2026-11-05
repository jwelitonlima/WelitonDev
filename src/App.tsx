import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PageTransitionProvider } from "@/components/PageTransition";
import Header from "@/components/Header";
import Index from "./pages/Index";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import FreightDashboard from "./pages/FreightDashboard";
import FreightTracking from "./pages/FreightTracking";
import FreightDetailPage from "./pages/FreightDetailPage";
import FreightSettings from "./pages/FreightSettings";

const queryClient = new QueryClient();

const freightRoutes = ["/dashboard", "/rastreamento", "/configuracoes"];

const AppContent = () => {
  const location = useLocation();
  const isFreightApp = freightRoutes.some((r) => location.pathname.startsWith(r)) || location.pathname.startsWith("/frete/");

  return (
    <PageTransitionProvider>
      {!isFreightApp && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/work" element={<Work />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/project/:slug" element={<ProjectDetail />} />
        <Route path="/dashboard" element={<FreightDashboard />} />
        <Route path="/rastreamento" element={<FreightTracking />} />
        <Route path="/frete/:id" element={<FreightDetailPage />} />
        <Route path="/configuracoes" element={<FreightSettings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransitionProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
