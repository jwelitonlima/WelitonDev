import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Menu, X, Truck, Activity, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dashboard", path: "/dashboard", icon: Activity },
  { label: "Rastreamento", path: "/rastreamento", icon: Truck },
];

interface FreightHeaderProps {
  alertCount?: number;
}

const FreightHeader = ({ alertCount = 0 }: FreightHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-2xl">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-foreground group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-freight-primary to-blue-400 flex items-center justify-center shadow-lg shadow-freight-primary/25 group-hover:shadow-freight-primary/40 transition-shadow">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-base tracking-tight">Frete<span className="text-freight-primary">AI</span></span>
          </Link>

          {/* Live indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-freight-success/10 border border-freight-success/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-freight-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-freight-success" />
            </span>
            <span className="text-[10px] font-medium text-freight-success uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                location.pathname === link.path
                  ? "bg-freight-primary/10 text-freight-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          <Link
            to="/configuracoes"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
              location.pathname === "/configuracoes"
                ? "bg-freight-primary/10 text-freight-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Configurações
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Clock */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground font-mono tabular-nums">
            {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors group" aria-label="Notificações">
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            {alertCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-freight-danger text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-freight-danger/30"
              >
                {alertCount > 9 ? "9+" : alertCount}
              </motion.span>
            )}
          </button>

          {/* Back to portfolio */}
          <Link
            to="/project/frete-ai"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/50"
          >
            <ChevronLeft className="w-3 h-3" />
            Portfólio
          </Link>

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted/50" aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/50 overflow-hidden bg-background/95 backdrop-blur-xl"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                    location.pathname === link.path
                      ? "bg-freight-primary/10 text-freight-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              <Link
                to="/configuracoes"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted/50"
              >
                Configurações
              </Link>
              <div className="border-t border-border/50 pt-2 mt-2">
                <Link
                  to="/project/frete-ai"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar ao Portfólio
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default FreightHeader;
