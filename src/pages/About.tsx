import { motion } from "framer-motion";
import { Globe, Palette, Code, Star } from "lucide-react";
import aboutPhoto from "@/assets/hero-portrait.png";
import WavyDivider from "@/components/WavyDivider";
import Footer from "@/components/Footer";

const services = [
  {
    number: "01",
    title: "Design",
    description: "Criação de interfaces modernas, intuitivas e visualmente impactantes que convertem visitantes em clientes.",
    icon: Palette,
  },
  {
    number: "02",
    title: "Desenvolvimento",
    description: "Desenvolvimento de aplicações web performáticas, escaláveis e com código limpo utilizando tecnologias modernas.",
    icon: Code,
  },
  {
    number: "03",
    title: "Pacote Completo",
    description: "Do conceito à entrega final — design, desenvolvimento, deploy e suporte. Tudo em um só lugar.",
    icon: Star,
  },
];

const AboutPage = () => {
  return (
    <main>
      <section className="section-light pt-32 pb-20">
        <div className="container-wide">
          {/* Title row */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
            >
              Ajudando marcas a prosperar no mundo digital
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Combino criatividade com expertise técnico para criar produtos digitais que não apenas
                funcionam bem, mas também encantam os usuários com experiências memoráveis.
              </p>
            </motion.div>
          </div>

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl overflow-hidden mb-24 aspect-[16/7]"
          >
            <img src={aboutPhoto} alt="Weliton working" className="w-full h-full object-cover" />
          </motion.div>

          {/* Services */}
          <div className="mb-10">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-8">
              Posso te ajudar com...
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {services.map((service, i) => (
              <motion.div
                key={service.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background p-8 md:p-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-muted-foreground">{service.number}</span>
                  <service.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
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
