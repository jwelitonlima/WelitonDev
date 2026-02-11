import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import TransitionLink from "@/components/TransitionLink";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100svh] items-center justify-center section-light">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">Página não encontrada</p>
        <TransitionLink to="/" className="text-sm font-medium link-underline text-foreground">
          ← Voltar ao início
        </TransitionLink>
      </div>
    </div>
  );
};

export default NotFound;
