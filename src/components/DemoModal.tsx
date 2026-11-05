import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-6xl h-[85vh] bg-background rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-background z-10 shrink-0">
              <h3 className="font-semibold text-foreground truncate pr-4">{title} - Demo</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Fechar demo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 w-full bg-slate-100 relative">
              <iframe
                src={url}
                title={`Demo de ${title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};