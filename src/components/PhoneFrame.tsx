interface PhoneFrameProps {
  videoUrl: string;
  isDetail?: boolean;
  showIsland?: boolean;
  className?: string;
}

/**
 * iPhone 14 Pro minimalista.
 * Tudo em % da largura: escala igual no card e na página de detalhe.
 * Proporção 1179x2556 (9:19.5). Raio externo ~15.5% da largura, bezel ~3%.
 */
export const PhoneFrame = ({
  videoUrl,
  isDetail = false,
  showIsland = true,
  className = "",
}: PhoneFrameProps) => {
  return (
    <div className={`relative aspect-[9/19.5] ${className}`}>
      {/* Botões laterais (ficam atrás da moldura) */}
      <span className="absolute -left-[1%] top-[13%] w-[1.4%] h-[3.5%] rounded-l-sm bg-[#2a2a2c]" />
      <span className="absolute -left-[1%] top-[19.5%] w-[1.4%] h-[6.5%] rounded-l-sm bg-[#2a2a2c]" />
      <span className="absolute -left-[1%] top-[27.5%] w-[1.4%] h-[6.5%] rounded-l-sm bg-[#2a2a2c]" />
      <span className="absolute -right-[1%] top-[22%] w-[1.4%] h-[10%] rounded-r-sm bg-[#2a2a2c]" />

      {/* Moldura em aço escuro */}
      <div
        className="relative w-full h-full p-[3%]"
        style={{
          borderRadius: "15.5% / 7.15%",
          background: "linear-gradient(145deg, #3a3a3d 0%, #1b1b1d 45%, #2c2c2f 100%)",
          boxShadow:
            "inset 0 0 0 1.5px rgba(255,255,255,0.14), inset 0 0 0 4px #0b0b0c, 0 25px 50px -12px rgba(0,0,0,0.35)",
        }}
      >
        {/* Tela */}
        <div
          className="relative w-full h-full bg-black overflow-hidden"
          style={{ borderRadius: "13.3% / 5.9%" }}
        >
          <video
            src={videoUrl}
            autoPlay
            muted={!isDetail}
            loop
            controls={isDetail}
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Dynamic Island */}
          {showIsland && (
            <div className="absolute top-[1.3%] inset-x-0 flex justify-center pointer-events-none">
              <div className="w-[32%] aspect-[125/37] bg-black rounded-full" />
            </div>
          )}

          {/* Reflexo sutil do vidro */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.04] to-white/10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};