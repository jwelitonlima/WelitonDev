import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const DemoModal = ({ isOpen, onClose, url, title }: DemoModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-6xl h-full sm:h-[85vh] bg-background rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background z-10 shrink-0">
              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate pr-4">
                {title} - Demo
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Abrir em Nova Aba</span>
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Fechar demo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Iframe da Demo - Ajustado para proporção mobile */}
            <div className="flex-1 w-full bg-slate-100 flex items-center justify-center p-2 sm:p-0 overflow-hidden">
              <div className="w-full h-full sm:w-full sm:h-full max-w-md sm:max-w-none bg-white rounded-lg sm:rounded-none overflow-hidden shadow-inner">
                <iframe
                  src={url}
                  title={`Demo de ${title}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};