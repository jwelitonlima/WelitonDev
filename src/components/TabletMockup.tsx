import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TabletMockupProps {
  videoUrl: string;
  urlText?: string;
}

export const TabletMockup = ({ 
  videoUrl, 
  urlText = "weliton-dev.vercel.app/project/frete-ai" 
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
        // Após terminar de digitar, espera 1.2s e "carrega" o site
        setTimeout(() => setIsTyping(false), 1200);
      }
    }, 90); 

    return () => clearInterval(interval);
  }, [urlText]);

  return (
    <div className="w-full flex justify-center py-8">
      {/* Corpo do iPad Pro - Minimalista, bordas finas e cantos acentuados */}
      <div className="relative w-full max-w-[1000px] aspect-[4/3] sm:aspect-[16/11] bg-black rounded-[2.5rem] sm:rounded-[3rem] p-[6px] sm:p-[10px] shadow-2xl border-[1.5px] border-zinc-700/50 ring-1 ring-white/10">
        
        {/* Reflexo sutil na borda superior */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent z-20 pointer-events-none" />

        {/* Tela do iPad */}
        <div className="relative w-full h-full bg-[#050505] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5">
          
          {/* Barra do Navegador (Safari-style, minimalista) */}
          <div className="h-10 sm:h-12 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
            {/* Botões estilo macOS/Apple (minimalistas) */}
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
            </div>
            
            {/* Barra de URL centralizada */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-lg h-7 sm:h-8 flex items-center justify-center px-3 overflow-hidden transition-colors hover:bg-white/[0.05]">
                <span className="text-[10px] sm:text-xs text-zinc-400 font-sans tracking-tight flex items-center gap-1.5">
                  {/* Ícone de Cadeado */}
                  <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  
                  {/* Texto digitado com cursor piscando */}
                  {isTyping ? (
                    <span>
                      {typedText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-[1px] h-3 bg-zinc-400 ml-0.5 align-middle"
                      />
                    </span>
                  ) : (
                    <span className="text-zinc-300">{urlText}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Espaçador para manter a barra de URL centralizada */}
            <div className="w-[38px] shrink-0" /> 
          </div>

          {/* Área do Vídeo */}
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {isTyping ? (
                // Tela de Loading fake (minimalista)
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full"
                  />
                  <p className="text-zinc-500 text-[10px] mt-3 font-sans tracking-widest uppercase">Carregando</p>
                </motion.div>
              ) : (
                // O Vídeo com controles nativos
                <motion.video
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  controls
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