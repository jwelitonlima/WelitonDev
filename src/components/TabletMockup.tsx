import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Play } from "lucide-react";

interface TabletMockupProps {
  videoUrl: string;
  urlText?: string;
}

export const TabletMockup = ({
  videoUrl,
  urlText = "https://weliton-dev.vercel.app/project/frete-ai",
}: TabletMockupProps) => {
  const [isTyping, setIsTyping] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Efeito de digitação na barra de URL (mantido no mobile e desktop)
  useEffect(() => {
    let i = 0;
    setTypedText("");
    setIsTyping(true);
    
    const interval = setInterval(() => {
      setTypedText((prev) => urlText.slice(0, i + 1));
      i++;
      if (i >= urlText.length) {
        clearInterval(interval);
        setTimeout(() => setIsTyping(false), 1200);
      }
    }, 90);

    return () => clearInterval(interval);
  }, [urlText]);

  const handleStart = () => {
    setHasStarted(true);
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.play().catch(() => {
        video.play().catch(() => {});
      });
    }
  };

  return (
    <div className="w-full flex justify-center py-4 sm:py-8">
      {/* Moldura padronizada com o portfólio */}
      <div className="relative w-full max-w-5xl flex flex-col items-center justify-end">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#1a1a1a] rounded-2xl sm:rounded-3xl p-[10px] sm:p-[14px] pb-[16px] sm:pb-[20px] shadow-2xl border-[2px] border-gray-700">
          {/* Câmera/notch sutil no topo */}
          <div className="absolute top-2 inset-x-0 h-3 flex justify-center z-20">
            <div className="w-3 h-3 bg-[#111] rounded-full border border-gray-800 shadow-inner" />
          </div>

          {/* Tela */}
          <div className="relative w-full h-full bg-[#050505] rounded-lg sm:rounded-xl overflow-hidden flex flex-col border border-white/5">
            {/* Barra do navegador */}
            <div className="h-9 sm:h-11 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 sm:px-5 shrink-0 z-20">
              <div className="flex gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
              </div>

              <div className="flex-1 flex justify-center px-2">
                {/* Barra de URL - Truncada, sem quebra de linha e com animação de digitação */}
                <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-lg h-6 sm:h-7 flex items-center justify-start px-2 sm:px-3 overflow-hidden transition-colors hover:bg-white/[0.05]">
                  <span className="text-[9px] sm:text-xs text-zinc-400 font-sans tracking-tight flex items-center gap-1.5 w-full truncate whitespace-nowrap">
                    <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>

                    {isTyping ? (
                      <span className="truncate">
                        {typedText}
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="inline-block w-[1px] h-3 bg-zinc-400 ml-0.5 align-middle"
                        />
                      </span>
                    ) : (
                      <span className="truncate">{urlText}</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="w-[34px] shrink-0" />
            </div>

            {/* Área do vídeo */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {isTyping ? (
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
                  <motion.div
                    key="video"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-full"
                  >
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls={hasStarted}
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain bg-black"
                    />

                    {/* Overlay de Play + Aviso de áudio */}
                    <AnimatePresence>
                      {!hasStarted && (
                        <motion.button
                          type="button"
                          onClick={handleStart}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-[2px] group cursor-pointer"
                          aria-label="Reproduzir vídeo com áudio"
                        >
                          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 text-black shadow-2xl transition-transform group-hover:scale-110">
                            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                          </div>

                          {/* Aviso de áudio pulsante */}
                          <motion.div 
                            animate={{ 
                              scale: [1, 1.05, 1],
                              boxShadow: [
                                "0px 0px 0px 0px rgba(16, 185, 129, 0)",
                                "0px 0px 0px 4px rgba(16, 185, 129, 0.15)",
                                "0px 0px 0px 0px rgba(16, 185, 129, 0)"
                              ]
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 2,
                              ease: "easeInOut"
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 border border-primary/30 text-white text-[10px] sm:text-sm font-medium"
                          >
                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            <span className="text-primary font-semibold tracking-wide">
                              Clique para ativar o áudio
                            </span>
                          </motion.div>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Base / suporte, como no mockup padrão do portfólio */}
        <div className="relative w-[112%] h-4 sm:h-5 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-2xl shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gray-700 rounded-b-md" />
        </div>
      </div>
    </div>
  );
};