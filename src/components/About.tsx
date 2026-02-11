import { motion } from "framer-motion";
import { Code, Monitor, Server } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="section-padding">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-primary font-mono text-base block mb-2">01.</span>
            Sobre Mim
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-secondary-foreground leading-relaxed">
              Sou um desenvolvedor apaixonado por criar soluções digitais modernas e eficientes.
              Com experiência em desenvolvimento web full stack, transformo ideias em aplicações
              reais com código limpo e interfaces intuitivas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Busco constantemente aprender novas tecnologias e aprimorar minhas habilidades,
              sempre focando na melhor experiência para o usuário final.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid gap-4"
          >
            {[
              { icon: Monitor, title: "Frontend", desc: "React, TypeScript, Tailwind CSS" },
              { icon: Server, title: "Backend", desc: "Node.js, APIs REST, Bancos de Dados" },
              { icon: Code, title: "DevOps", desc: "Git, CI/CD, Deploy" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-glow transition-colors"
              >
                <div className="p-2 rounded-md bg-secondary">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
