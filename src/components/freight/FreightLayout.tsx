import { useEffect } from "react";

interface FreightLayoutProps {
  children: React.ReactNode;
}

const FreightLayout = ({ children }: FreightLayoutProps) => {
  useEffect(() => {
    // Adiciona o tema escuro geral (para o layout base)
    document.documentElement.classList.add("dark");
    // Adiciona a classe exclusiva para sobrescrever as cores com o estilo Apple (preto/branco)
    document.documentElement.classList.add("freight-theme"); 
    
    return () => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("freight-theme");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
};

export default FreightLayout;