import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface SoundAlertProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const SoundAlert = ({ videoRef }: SoundAlertProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Monitora o estado de mudo do vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVolumeChange = () => setIsMuted(video.muted);
    video.addEventListener("volumechange", handleVolumeChange);

    // Esconde o alerta automaticamente após 6 segundos
    const timer = setTimeout(() => setIsVisible(false), 6000);

    return () => {
      video.removeEventListener("volumechange", handleVolumeChange);
      clearTimeout(timer);
    };
  }, [videoRef]);

  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1; // Garante volume máximo
      setIsMuted(false);
      setIsVisible(false); // Esconde o alerta após desmutar
    }
  };

  return (
    <AnimatePresence>
      {isMuted && isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // Curva de animação estilo Apple
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={handleUnmute}
            className="group flex items-center gap-3 px-5 py-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-2xl hover:bg-black/80 transition-all duration-300"
          >
            {/* Ícone animado com ondas sonoras */}
            <div className="relative flex items-center justify-center w-6 h-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-emerald-500/40"
              />
              <VolumeX className="w-5 h-5 text-emerald-400 relative z-10 group-hover:text-emerald-300 transition-colors" />
            </div>
            
            <span className="text-sm font-medium tracking-wide">
              Clique para ativar o som
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};