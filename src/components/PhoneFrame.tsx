interface PhoneFrameProps {
  videoUrl: string;
  isDetail?: boolean;
  showIsland?: boolean;
  className?: string;
}

/**
 * Moldura de iPhone escalável: raio, bezel e botões em % da largura,
 * então fica idêntica em qualquer tamanho (card ou página de detalhe).
 */
export const PhoneFrame = ({
  videoUrl,
  isDetail = false,
  showIsland = true,
  className = "",
}: PhoneFrameProps) => {
  return (
    <div
      className={`relative aspect-[9/19.5] bg-[#1a1a1a] p-[3.2%] shadow-2xl border-[2px] border-gray-700 ${className}`}
      style={{ borderRadius: "15% / 6.9%" }}
    >
      {/* Botões laterais */}
      <div className="absolute top-[15%] -left-[1.5%] w-[1.5%] h-[4%] bg-gray-600 rounded-l-md" />
      <div className="absolute top-[22%] -left-[1.5%] w-[1.5%] h-[7%] bg-gray-600 rounded-l-md" />
      <div className="absolute top-[31%] -left-[1.5%] w-[1.5%] h-[7%] bg-gray-600 rounded-l-md" />
      <div className="absolute top-[25%] -right-[1.5%] w-[1.5%] h-[10%] bg-gray-600 rounded-r-md" />

      {/* Tela */}
      <div
        className="relative w-full h-full bg-black overflow-hidden"
        style={{ borderRadius: "12.6% / 5.6%" }}
      >
        {showIsland && (
          <div className="absolute top-[1.2%] inset-x-0 flex justify-center z-20 pointer-events-none">
            <div className="w-[30%] aspect-[4/1] bg-black rounded-full flex items-center justify-end pr-[5%]">
              <div className="w-[10%] aspect-square bg-[#111] rounded-full border border-gray-800" />
            </div>
          </div>
        )}

        <video
          src={videoUrl}
          autoPlay
          muted={!isDetail}
          loop
          controls={isDetail}
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
      </div>
    </div>
  );
};