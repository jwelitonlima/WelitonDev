import { motion } from "framer-motion";
import { Mail, Github, Linkedin } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="section-padding">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-primary font-mono text-base block mb-2">04.</span>
            Contato
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground mb-10 text-lg"
        >
          Estou disponível para novos projetos e oportunidades. Entre em contato!
        </motion.p>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          href="mailto:weliton@email.com"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground font-mono font-semibold rounded-lg hover:opacity-90 transition-all box-glow mb-12"
        >
          Enviar E-mail
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-6"
        >
          {[
            { icon: Github, href: "#", label: "GitHub" },
            { icon: Linkedin, href: "#", label: "LinkedIn" },
            { icon: Mail, href: "mailto:weliton@email.com", label: "Email" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className="p-3 rounded-lg bg-card border border-border hover:border-glow hover:text-primary text-muted-foreground transition-all"
            >
              <item.icon className="w-5 h-5" />
            </a>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground font-mono">
          © {new Date().getFullYear()} Weliton Dev — Todos os direitos reservados
        </p>
      </div>
    </section>
  );
};

export default Contact;
