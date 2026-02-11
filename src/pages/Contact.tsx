import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  organization: z.string().trim().max(100).optional(),
  services: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(2000),
});

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    services: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    toast.success("Mensagem enviada com sucesso!");
    setForm({ name: "", email: "", organization: "", services: "", message: "" });
  };

  const fields = [
    { num: "01", label: "Qual é o seu nome?", key: "name", placeholder: "João Silva" },
    { num: "02", label: "Qual é o seu e-mail?", key: "email", placeholder: "joao@email.com" },
    { num: "03", label: "Qual é a sua organização?", key: "organization", placeholder: "Empresa & Cia ®" },
    { num: "04", label: "Quais serviços você procura?", key: "services", placeholder: "Web Design, Desenvolvimento Web..." },
  ];

  return (
    <main className="section-dark min-h-[100svh]">
      <div className="container-wide pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">
          {/* Form */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-fg mb-10 sm:mb-16"
            >
              Vamos iniciar um projeto juntos
            </motion.h1>

            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
              {fields.map((field, i) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <label className="flex items-baseline gap-3 mb-3">
                    <span className="text-xs text-dark-fg/40">{field.num}</span>
                    <span className="text-sm text-dark-fg/80">{field.label}</span>
                  </label>
                  <input
                    type={field.key === "email" ? "email" : "text"}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent border-b border-dark-fg/20 pb-3 text-dark-fg placeholder:text-dark-fg/20 focus:outline-none focus:border-primary transition-colors text-base"
                  />
                  {errors[field.key] && (
                    <p className="text-xs text-destructive mt-1">{errors[field.key]}</p>
                  )}
                </motion.div>
              ))}

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.42, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <label className="flex items-baseline gap-3 mb-3">
                  <span className="text-xs text-dark-fg/40">05</span>
                  <span className="text-sm text-dark-fg/80">Sua mensagem</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Olá Weliton, gostaria de..."
                  rows={4}
                  className="w-full bg-transparent border-b border-dark-fg/20 pb-3 text-dark-fg placeholder:text-dark-fg/20 focus:outline-none focus:border-primary transition-colors resize-none text-base"
                />
                {errors.message && (
                  <p className="text-xs text-destructive mt-1">{errors.message}</p>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                type="submit"
                className="btn-primary-circle w-32 h-32 sm:w-40 sm:h-40 text-xs sm:text-sm font-semibold gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar!
              </motion.button>
            </form>
          </div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 sm:space-y-10 pt-4 border-t border-dark-fg/10 lg:border-t-0 mt-4 lg:mt-0"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-dark-fg/40 mb-3">Detalhes de Contato</p>
              <p className="text-sm text-dark-fg/80 mb-1">contato@welitondev.com</p>
              <a href="https://wa.me/5575981828601" target="_blank" rel="noopener noreferrer" className="text-sm text-dark-fg/80 link-underline inline-block w-fit hover:text-dark-fg transition-colors">+55 (75) 9 8182-8601</a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-dark-fg/40 mb-3">Detalhes Comerciais</p>
              <p className="text-sm text-dark-fg/80 mb-1">Weliton Dev</p>
              <p className="text-sm text-dark-fg/80">Brasil</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-dark-fg/40 mb-3">Redes Sociais</p>
              <div className="flex flex-row lg:flex-col gap-4 lg:gap-2">
                <a href="https://github.com/jwelitonlima" target="_blank" rel="noopener noreferrer" className="text-sm text-dark-fg/80 link-underline inline-block w-fit">
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/jweliton" target="_blank" rel="noopener noreferrer" className="text-sm text-dark-fg/80 link-underline inline-block w-fit">
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
