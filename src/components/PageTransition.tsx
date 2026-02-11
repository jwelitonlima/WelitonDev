import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const pageNames: Record<string, string> = {
  "/": "Home",
  "/work": "Work",
  "/about": "About",
  "/contact": "Contact",
};

interface PageTransitionContextValue {
  navigateWithTransition: (to: string) => void;
}

import { createContext, useContext } from "react";

export const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigateWithTransition: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

export const PageTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetPath, setTargetPath] = useState("");
  const [showTitle, setShowTitle] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithTransition = useCallback(
    (to: string) => {
      if (to === location.pathname) return;
      setTargetPath(to);
      setIsTransitioning(true);
      setShowTitle(false);
    },
    [location.pathname]
  );

  useEffect(() => {
    if (!isTransitioning) return;

    // After overlay appears, show title
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
      // Navigate while overlay is visible
      navigate(targetPath);
    }, 400);

    // After title fades in, start removing overlay
    const removeTimer = setTimeout(() => {
      setIsTransitioning(false);
      setShowTitle(false);
      window.scrollTo(0, 0);
    }, 1600);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(removeTimer);
    };
  }, [isTransitioning, targetPath, navigate]);

  const pageName = pageNames[targetPath] || "Page";

  return (
    <PageTransitionContext.Provider value={{ navigateWithTransition }}>
      {children}

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: "hsl(var(--dark-bg))" }}
          >
            <AnimatePresence>
              {showTitle && (
                <motion.h2
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl sm:text-6xl md:text-7xl font-bold text-dark-fg"
                >
                  {pageName}
                </motion.h2>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
};
