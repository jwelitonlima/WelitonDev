import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VolumeX } from "lucide-react";

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

    // Esconde o alerta automaticamente após 8 segundos (se o usuário não interagir)
    const timer = setTimeout(() => {
      if (video.muted) setIsVisible(false);
    }, 8000);

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
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isMuted && isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // Curva Apple
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={handleUnmute}
            className="group flex items-center gap-3 px-5 py-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-2xl hover:bg-black/80 transition-all duration-300"
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              {/* Pulso verde ao redor do ícone */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-emerald-500/50"
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