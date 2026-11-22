import { TabletMockup } from "./TabletMockup";
import { DeviceMockupCarousel } from "./DeviceMockupCarousel";
import { Project } from "@/data/projects";

interface ProjectMockupProps {
  project: Project;
  isDetail?: boolean; // true na página de detalhes, false na home
}

export const ProjectMockup = ({ project, isDetail = false }: ProjectMockupProps) => {
  const isDesktop = project.deviceType === "desktop";

  if (project.slug === "frete-ai" && project.videoUrl) {
    return (
      <TabletMockup
        videoUrl={project.videoUrl}
        urlText="https://weliton-dev.vercel.app/project/frete-ai"
      />
    );
  }

  if (project.gallery) {
    return (
      <DeviceMockupCarousel
        images={project.gallery}
        videoUrl={project.videoUrl}
        title={project.title}
        deviceType={project.deviceType}
      />
    );
  }

  if (isDesktop && project.videoUrl) {
    return (
      <div className="w-full flex justify-center">
        <div className="relative w-full max-w-5xl flex flex-col items-center justify-end">
          <div className="relative w-full aspect-video bg-[#1a1a1a] rounded-t-2xl p-[14px] pb-[20px] shadow-2xl border-[2px] border-gray-700">
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              <div className="absolute top-2 inset-x-0 h-3 flex justify-center z-20">
                <div className="w-3 h-3 bg-[#111] rounded-full border border-gray-800 shadow-inner"></div>
              </div>
              <video
                src={project.videoUrl}
                autoPlay
                muted={!isDetail} // Mudo na home para não assustar
                loop
                controls={isDetail}
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
            </div>
          </div>
          <div className="relative w-[112%] h-5 sm:h-6 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-2xl shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gray-700 rounded-b-md"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback para imagem simples
  return (
    <img
      src={project.image}
      alt={project.title}
      className="w-full h-auto max-h-[80vh] object-contain drop-shadow-2xl rounded-lg"
    />
  );
};