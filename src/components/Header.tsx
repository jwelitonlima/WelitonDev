import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import TransitionLink from "./TransitionLink";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isDarkPage = location.pathname === "/contact";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? isDarkPage
              ? "bg-dark-bg/90 backdrop-blur-xl"
              : "bg-background/90 backdrop-blur-xl"
            : ""
        }`}
      >
        <div className="container-wide flex items-center justify-between py-4 md:py-5">
          <TransitionLink
            to="/"
            className={`text-sm font-medium tracking-tight relative z-50 transition-colors duration-300 ${
              menuOpen ? "text-dark-fg" : isDarkPage ? "text-dark-fg" : "text-foreground"
            }`}
          >
            Weliton <span className="font-bold">Dev</span>
          </TransitionLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <TransitionLink
                key={link.path}
                to={link.path}
                className={`text-sm link-underline flex items-center gap-2 ${
                  isDarkPage ? "text-dark-fg/70 hover:text-dark-fg" : "text-muted-foreground hover:text-foreground"
                } transition-colors`}
              >
                {location.pathname === link.path && (
                  <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                )}
                {link.label}
              </TransitionLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-50 ${
              menuOpen
                ? "bg-primary text-primary-foreground"
                : isDarkPage
                  ? "bg-dark-fg text-dark-bg"
                  : "bg-foreground text-background"
            }`}
            aria-label="Menu"
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile menu overlay - slide from top */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 z-40 flex flex-col"
              style={{ backgroundColor: "hsl(var(--dark-bg))" }}
            >
              <div className="flex-1 flex flex-col justify-center px-8 sm:px-12">
                {/* Navigation label */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-xs uppercase tracking-[0.2em] text-dark-fg/30 mb-8"
                >
                  Navegação
                </motion.p>

                {/* Nav links */}
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.2 + i * 0.08,
                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                      }}
                    >
                      <TransitionLink
                        to={link.path}
                        onClick={() => setMenuOpen(false)}
                        className="text-4xl sm:text-5xl font-bold text-dark-fg hover:text-primary transition-colors duration-300 flex items-center gap-4 py-2"
                      >
                        {location.pathname === link.path && (
                          <motion.span
                            layoutId="mobile-nav-dot"
                            className="w-3 h-3 rounded-full bg-accent flex-shrink-0"
                          />
                        )}
                        <span>{link.label}</span>
                      </TransitionLink>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Bottom section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="px-8 sm:px-12 pb-10"
              >
                {/* Socials */}
                <p className="text-xs uppercase tracking-[0.2em] text-dark-fg/30 mb-4">Redes Sociais</p>
                <div className="flex gap-6 mb-6">
                  {["GitHub", "LinkedIn", "Instagram"].map((s) => (
                    <a key={s} href="#" className="text-sm text-dark-fg/60 hover:text-dark-fg transition-colors">
                      {s}
                    </a>
                  ))}
                </div>
                <div className="border-t border-dark-fg/10 pt-4 flex justify-between items-center">
                  <span className="text-xs text-dark-fg/30">v.2025.1</span>
                  <span className="text-xs text-dark-fg/30">weliton@email.com</span>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
