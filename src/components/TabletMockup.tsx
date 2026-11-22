import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TabletMockupProps {
  videoUrl: string;
  urlText?: string;
}

export const TabletMockup = ({ 
  videoUrl, 
  urlText = "welitondev.com/dashboard" 
}: TabletMockupProps) => {
  const [isTyping, setIsTyping] = useState(true);
  const [typedText, setTypedText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Efeito de digitação na barra de URL
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => urlText.slice(0, i + 1));
      i++;
      if (i >= urlText.length) {
        clearInterval(interval);
        // Após terminar de digitar, espera 1s e "carrega" o site
        setTimeout(() => setIsTyping(false), 1000);
      }
    }, 100); // Velocidade da digitação (100ms por caractere)

    return () => clearInterval(interval);
  }, [urlText]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div className="w-full flex justify-center py-8">
      {/* Corpo do Tablet */}
      <div className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-[16/10] bg-zinc-900 rounded-[2.5rem] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[6px] sm:border-[12px] border-zinc-800 ring-1 ring-white/10">
        
        {/* Câmera frontal do tablet */}
        <div className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner z-20" />

        {/* Tela do Tablet */}
        <div className="relative w-full h-full bg-[#0a0a0a] rounded-xl overflow-hidden flex flex-col">
          
          {/* Barra do Navegador (Fake) */}
          <div className="h-12 bg-zinc-900 border-b border-white/5 flex items-center px-4 gap-3 shrink-0 z-20">
            {/* Botões Mac-style */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            
            {/* Barra de URL */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md bg-black/50 border border-white/10 rounded-md h-7 flex items-center px-3 overflow-hidden">
                <span className="text-[10px] sm:text-xs text-zinc-400 font-mono tracking-tight flex items-center gap-2">
                  {/* Ícone de Cadeado */}
                  <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  
                  {/* Texto digitado com cursor piscando */}
                  {isTyping ? (
                    <span>
                      {typedText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-1 h-3 bg-white ml-0.5 align-middle"
                      />
                    </span>
                  ) : (
                    <span className="text-white">{urlText}</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Área do Vídeo */}
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {isTyping ? (
                // Tela de Loading fake enquanto "carrega"
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-8 h-8 border-2 border-white/10 border-t-emerald-500 rounded-full"
                  />
                  <p className="text-zinc-500 text-xs mt-4 font-mono">Carregando ambiente...</p>
                </motion.div>
              ) : (
                // O Vídeo
                <motion.video
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  controls // <-- CONTROLES NATIVOS ATIVADOS AQUI
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
};