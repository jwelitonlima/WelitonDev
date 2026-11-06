import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface DeviceMockupCarouselProps {
  images: string[];
  videoUrl?: string;
  title: string;
}

export const DeviceMockupCarousel = ({ images, videoUrl, title }: DeviceMockupCarouselProps) => {
  return (
    <div className="w-full relative">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
        <ArrowRight className="w-4 h-4" /> Arraste para ver as telas e a demonstração do app
      </p>
      
      <div className="flex gap-6 sm:gap-10 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-none px-2 items-center">
        
        {images.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="relative shrink-0 w-[280px] sm:w-[380px] snap-center rounded-2xl overflow-hidden shadow-lg bg-white"
          >
            <img
              src={img}
              alt={`${title} - Tela ${index + 1}`}
              className="w-full h-auto object-contain"
            />
          </motion.div>
        ))}

        {videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: images.length * 0.1, duration: 0.6 }}
            className="relative shrink-0 w-[280px] sm:w-[380px] snap-center flex justify-center items-center py-4"
          >
            <div className="relative w-full aspect-[9/19.5] bg-[#1a1a1a] rounded-[3rem] p-[10px] shadow-2xl border-[2px] border-gray-700">
              
              <div className="absolute top-[15%] -left-[4px] w-[4px] h-[30px] bg-gray-600 rounded-l-md"></div>
              <div className="absolute top-[25%] -left-[4px] w-[4px] h-[50px] bg-gray-600 rounded-l-md"></div>
              <div className="absolute top-[35%] -left-[4px] w-[4px] h-[50px] bg-gray-600 rounded-l-md"></div>
              <div className="absolute top-[25%] -right-[4px] w-[4px] h-[70px] bg-gray-600 rounded-r-md"></div>

              <div className="relative w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
                <div className="absolute top-2 inset-x-0 h-7 flex justify-center z-20">
                  <div className="w-28 h-7 bg-black rounded-full flex items-center justify-end px-3">
                    <div className="w-3 h-3 bg-[#111] rounded-full border border-gray-800 shadow-inner"></div>
                  </div>
                </div>

                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover rounded-[2.5rem]"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none rounded-[2.5rem]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};