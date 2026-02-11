import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Menu, X, Truck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Rastreamento", path: "/rastreamento" },
  { label: "Configurações", path: "/configuracoes" },
];

interface FreightHeaderProps {
  alertCount?: number;
}

const FreightHeader = ({ alertCount = 0 }: FreightHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-foreground">
          <div className="w-8 h-8 rounded-lg bg-freight-primary flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="text-base">Frete<span className="text-freight-primary">AI</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm transition-colors",
                location.pathname === link.path ? "text-freight-primary font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Notificações">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-freight-danger text-white text-[10px] font-bold flex items-center justify-center">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted" aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-card"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm transition-colors",
                    location.pathname === link.path ? "bg-freight-primary/10 text-freight-primary font-medium" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
              >
                ← Voltar ao Portfólio
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default FreightHeader;
