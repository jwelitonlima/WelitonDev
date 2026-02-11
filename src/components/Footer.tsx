import { useState, useEffect } from "react";
import TransitionLink from "./TransitionLink";

const Footer = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const isDark = variant === "dark";
  const textMain = isDark ? "text-dark-fg" : "text-foreground";
  const textMuted = isDark ? "text-dark-fg/50" : "text-muted-foreground";
  const borderColor = isDark ? "border-dark-fg/10" : "border-border";
  const bg = isDark ? "section-dark" : "section-light";

  return (
    <footer className={`${bg} py-10`}>
      <div className="container-wide">
        {/* CTA */}
        <div className="text-center py-12 sm:py-16 md:py-24">
          <p className={`text-sm uppercase tracking-widest mb-4 sm:mb-6 ${textMuted}`}>
            Vamos trabalhar juntos
          </p>
          <h2 className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-8 sm:mb-10 ${textMain}`}>
            Vamos trabalhar<br />juntos
          </h2>
          <TransitionLink
            to="/contact"
            className="btn-primary-circle w-32 h-32 sm:w-40 sm:h-40 text-xs sm:text-sm font-semibold hover:scale-110"
          >
            Entre em contato
          </TransitionLink>
        </div>

        {/* Bottom bar */}
        <div className={`border-t ${borderColor} pt-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center`}>
          <div className="flex items-center justify-between sm:justify-start gap-6">
            <span className={`text-xs ${textMuted}`}>VERSÃO</span>
            <span className={`text-xs ${textMain}`}>v.2025.1</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-6">
            <span className={`text-xs ${textMuted}`}>HORA LOCAL</span>
            <span className={`text-xs ${textMain}`}>{time}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-6">
            <span className={`text-xs ${textMuted}`}>REDES</span>
            <div className="flex gap-4">
              <a href="https://github.com/jwelitonlima" target="_blank" rel="noopener noreferrer" className={`text-xs link-underline ${textMain}`}>
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/jweliton" target="_blank" rel="noopener noreferrer" className={`text-xs link-underline ${textMain}`}>
                LinkedIn
              </a>
              <a href="https://wa.me/5575981828601" target="_blank" rel="noopener noreferrer" className={`text-xs link-underline ${textMain}`}>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
