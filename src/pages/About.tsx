import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Palette, Code, Star, BrainCircuit, Database } from "lucide-react";
import aboutPhoto1 from "@/assets/optimized/about-memoji.webp";
import aboutPhoto2 from "@/assets/optimized/about-memoji-2.webp";
import aboutPhoto3 from "@/assets/optimized/about-memoji-3.webp";
import aboutPhoto4 from "@/assets/optimized/about-memoji-4.webp";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";

const aboutPhotos = [aboutPhoto1, aboutPhoto2, aboutPhoto3, aboutPhoto4];

const services = [
  {
    title: "AI Engineering & LLMs",
    description: "Construção de agentes autônomos, integração de modelos de linguagem (Groq, OpenAI) e automações inteligentes (n8n) para resolver problemas reais de negócio.",
    icon: BrainCircuit,
  },
  {
    title: "Desenvolvimento de Produto",
    description: "Desenvolvimento de aplicações web ponta a ponta com React, TypeScript e Vite. Interfaces modernas e arquitetura focada em performance e UX.",
    icon: Code,
  },
  {
    title: "Data Analytics",
    description: "Extração de insights e criação de dashboards interativos com Python, SQL, Streamlit e Power BI para embasar tomadas de decisão.",
    icon: Database,
  },
];

const AboutPage = () => {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % aboutPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      <section className="section-light pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="container-wide">
          {/* Title row */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-12 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mb-4">Sobre mim</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Sou Weliton,<br />
                <span className="text-primary">AI Builder</span> & Dev.
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Sou um construtor de soluções digitais focado na interseção entre Inteligência Artificial, Dados e Interfaces Modernas. Minha especialidade é transformar modelos complexos e dados brutos em produtos reais e utilizáveis.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Com uma base sólida em React, TypeScript e Python, construo desde dashboards analíticos até agentes de IA autônomos, sempre com um olhar apurado para a Experiência do Usuário (UX) e Design de Produto.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Minha vivência no setor de saúde, atuando na matriz de uma rede de laboratórios com 22 unidades, me deu a base para criar soluções de tecnologia focadas em HealthTech, entendendo a dor real de quem está na linha de frente.
              </p>
              <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed">
                Sou um desenvolvedor versátil que transforma ideias complexas em produtos digitais funcionais e inteligentes.
              </p>
            </motion.div>
          </div>

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl overflow-hidden mb-12 sm:mb-24 aspect-[16/9] sm:aspect-[16/7]"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={photoIndex}
                initial={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                transition={{
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: 0.6 },
                  scale: { duration: 1.1 },
                }}
                src={aboutPhotos[photoIndex]}
                alt="Weliton trabalhando"
                className="w-full h-full object-cover"
                loading={photoIndex === 0 ? "eager" : "lazy"}
              />
            </AnimatePresence>
          </motion.div>

          {/* Services */}
          <div className="mb-6 sm:mb-10">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mb-6 sm:mb-8">
              Posso te ajudar com...
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="bg-background p-6 sm:p-8 md:p-10"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WavyDivider direction="light-to-dark" />
      <Footer variant="dark" />
    </main>
  );
};

export default AboutPage;