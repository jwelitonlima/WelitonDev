import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PageTransitionProvider } from "@/components/PageTransition";
import Header from "@/components/Header";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Work = lazy(() => import("./pages/Work"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FreightDashboard = lazy(() => import("./pages/FreightDashboard"));
const FreightTracking = lazy(() => import("./pages/FreightTracking"));
const FreightDetailPage = lazy(() => import("./pages/FreightDetailPage"));
const FreightSettings = lazy(() => import("./pages/FreightSettings"));

const queryClient = new QueryClient();
const freightRoutes = ["/dashboard", "/rastreamento", "/configuracoes"];

const PageLoader = () => (
  <div className="min-h-[100svh] flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const isFreightApp = freightRoutes.some((r) => location.pathname.startsWith(r)) || location.pathname.startsWith("/frete/");

  return (
    <PageTransitionProvider>
      {!isFreightApp && <Header />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Rotas traduzidas */}
          <Route path="/projetos" element={<Work />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/projetos/:slug" element={<ProjectDetail />} />

          {/* Rotas antigas mantidas por compatibilidade */}
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/project/:slug" element={<ProjectDetail />} />

          {/* Rotas do FreteAI */}
          <Route path="/dashboard" element={<FreightDashboard />} />
          <Route path="/rastreamento" element={<FreightTracking />} />
          <Route path="/frete/:id" element={<FreightDetailPage />} />
          <Route path="/configuracoes" element={<FreightSettings />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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