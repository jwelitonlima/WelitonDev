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
  // Bloquear o scroll do fundo quando o modal estiver aberto
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            // No mobile, ocupa 100% da tela. No desktop, é um modal centralizado.
            className="relative w-full h-[100dvh] sm:h-[85vh] max-w-6xl bg-background sm:rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal - Otimizado para Mobile */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background z-10 shrink-0">
              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate pr-2">
                {title} <span className="hidden sm:inline">- Demo</span>
              </h3>
              
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Botão de Abrir em Nova Aba (Agora visível no mobile) */}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-xs font-medium"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="sm:inline">Abrir App</span>
                </a>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-foreground"
                  aria-label="Fechar demo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Iframe da Demo - Otimizado para toques e scroll */}
            <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
              <iframe
                src={url}
                title={`Demo de ${title}`}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                // Propriedades para melhorar a interação no mobile
                scrolling="yes"
                style={{ touchAction: 'pan-y' }} 
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};