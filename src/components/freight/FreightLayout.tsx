import { useEffect } from "react";

interface FreightLayoutProps {
  children: React.ReactNode;
}

const FreightLayout = ({ children }: FreightLayoutProps) => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
};

export default FreightLayout;
