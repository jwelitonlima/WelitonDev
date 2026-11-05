import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface DeviceMockupCarouselProps {
  images: string[];
  title: string;
}

export const DeviceMockupCarousel = ({ images, title }: DeviceMockupCarouselProps) => {
  return (
    <div className="w-full relative">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
        <ArrowRight className="w-4 h-4" /> Arraste para ver as telas do app
      </p>
      
      {/* Container do Carrossel */}
      <div className="flex gap-6 sm:gap-10 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-none px-2">
        {images.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="relative shrink-0 w-[260px] sm:w-[300px] aspect-[9/19.5] snap-center group"
          >
            {/* A moldura do iPhone */}
            <div className="absolute inset-0 rounded-[2.5rem] border-[10px] border-[#1a1a1a] bg-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
              
              {/* Dynamic Island (Ilha da câmera) */}
              <div className="absolute top-2 inset-x-0 h-6 flex justify-center z-20">
                <div className="w-24 h-6 bg-black rounded-full flex items-center justify-end px-3">
                  <div className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-full border border-gray-800"></div>
                </div>
              </div>

              {/* Imagem da tela */}
              <img
                src={img}
                alt={`${title} - Tela ${index + 1}`}
                className="w-full h-full object-cover rounded-[2rem]"
              />
              
              {/* Reflexo de vidro sutil na tela */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none rounded-[2rem]" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};