import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Trabalhos", path: "/work" },
  { label: "Sobre", path: "/about" },
  { label: "Contato", path: "/contact" },
];

const menuItemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: -20,
    filter: "blur(10px)",
    transition: { duration: 0.3, delay: i * 0.05, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  }),
};

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

  // Prevent body scroll when menu is open
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
              ? "bg-dark-bg/90 backdrop-blur-xl shadow-sm"
              : "bg-background/90 backdrop-blur-xl shadow-sm"
            : ""
        }`}
      >
        <div className="container-wide flex items-center justify-between py-4 md:py-5">
          <Link
            to="/"
            className={`text-sm font-medium tracking-tight ${isDarkPage || menuOpen ? "text-dark-fg" : "text-foreground"} relative z-50`}
          >
            © Code by <span className="font-bold">Weliton</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
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
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-50 ${
              menuOpen
                ? "bg-white/20 text-white"
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

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-foreground flex flex-col items-center justify-center"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground to-foreground/95" />

            <nav className="relative z-10 flex flex-col items-center gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  custom={i}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link
                    to={link.path}
                    className="text-4xl sm:text-5xl font-bold text-background hover:text-primary transition-colors duration-300 flex items-center gap-4"
                  >
                    {location.pathname === link.path && (
                      <motion.span
                        layoutId="nav-dot"
                        className="w-3 h-3 rounded-full bg-accent"
                      />
                    )}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-10 left-0 right-0 px-8 flex justify-between items-end"
            >
              <div className="flex gap-4">
                {["GitHub", "LinkedIn", "Instagram"].map((s) => (
                  <a key={s} href="#" className="text-xs text-background/50 hover:text-background transition-colors">
                    {s}
                  </a>
                ))}
              </div>
              <span className="text-xs text-background/30">v.2025.1</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
