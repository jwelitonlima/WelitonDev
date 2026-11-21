import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Menu, X, Activity, Truck, ChevronLeft } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between h-14">
        {/* Logo minimalista */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="text-base font-semibold tracking-tight text-foreground">Frete<span className="text-freight-primary">AI</span></span>
          </Link>

          {/* Live indicator sutil */}
          <div className="hidden md:flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
                location.pathname === link.path
                  ? "bg-foreground/5 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          ))}
          <Link
            to="/configuracoes"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
              location.pathname === "/configuracoes"
                ? "bg-foreground/5 text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Configurações
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground font-mono tabular-nums">
            {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>

          <button className="relative p-2 rounded-full hover:bg-muted/50 transition-colors group" aria-label="Notificações">
            <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {alertCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
              >
                {alertCount > 9 ? "9+" : alertCount}
              </motion.span>
            )}
          </button>

          <Link
            to="/project/frete-ai"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/40"
          >
            <ChevronLeft className="w-3 h-3" />
            Portfólio
          </Link>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-full hover:bg-muted/50" aria-label="Menu">
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
            className="md:hidden border-t border-border/40 overflow-hidden bg-background/95 backdrop-blur-xl"
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
                      ? "bg-foreground/5 text-foreground font-medium"
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
              <div className="border-t border-border/40 pt-2 mt-2">
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