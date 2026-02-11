import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
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

  const isDarkPage = location.pathname === "/contact";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDarkPage
              ? "bg-dark-bg/90 backdrop-blur-md"
              : "bg-background/90 backdrop-blur-md"
            : ""
        }`}
      >
        <div className="container-wide flex items-center justify-between py-5">
          <Link
            to="/"
            className={`text-sm font-medium tracking-tight ${isDarkPage ? "text-dark-fg" : "text-foreground"}`}
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
            className={`md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDarkPage ? "bg-dark-fg text-dark-bg" : "bg-foreground text-background"
            }`}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
            className="fixed inset-0 z-40 bg-foreground/95 flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-3xl font-semibold text-background hover:text-primary transition-colors flex items-center gap-3"
              >
                {location.pathname === link.path && (
                  <span className="w-3 h-3 rounded-full bg-accent" />
                )}
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
