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
    title: "Agentes e Automações com IA",
    description: "Fluxos no n8n e agentes com LLMs (Groq, Llama) que analisam dados, tomam uma decisão e avisam as pessoas, como o alerta no Telegram do FreteAI.",
    icon: BrainCircuit,
  },
  {
    title: "Desenvolvimento de Produto",
    description: "Aplicações web de ponta a ponta com React, TypeScript e Vite, com funções serverless na Vercel e banco no Supabase. Interfaces pensadas para o uso no dia a dia.",
    icon: Code,
  },
  {
    title: "Dados e Dashboards",
    description: "Pipelines em Python e Pandas, SQL e dashboards com Streamlit, Plotly e React para transformar dado bruto em decisão.",
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] mb-6">
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
                Sou de Picos, no Piauí, e construo automações e agentes com IA. Comecei em suporte técnico no Grupo Meddi, administrando o ELO Digital Office, plataforma que conecta 6 setores e 22 unidades, e foi lá que me interessei por tirar trabalho repetitivo das pessoas.</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Hoje uso React e TypeScript nas interfaces, Python para dados, e n8n com LLMs para montar agentes. Gosto de projetos que funcionam de ponta a ponta, do dado até o alerta ou o dashboard.</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Na saúde, aprendi na prática a não confiar cegamente no modelo: no InteraMed a IA lê a receita, mas a gravidade da interação é decidida por regras e pela base do OpenFDA. Estudo Tecnologia em Inteligência Artificial e sigo construindo, e o EspIAn, o monitor que roda neste próprio portfólio, é o mais recente.</p>
              <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed">
                Prefiro mostrar funcionando: cada projeto aqui tem demonstração, e eu conto o que deu errado e o que mudei.</p>
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