import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Footer = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
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
        <div className="text-center py-16 md:py-24">
          <p className={`text-sm uppercase tracking-widest mb-6 ${textMuted}`}>
            Vamos trabalhar juntos
          </p>
          <h2 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-10 ${textMain}`}>
            Let's work<br />together
          </h2>
          <Link
            to="/contact"
            className="btn-primary-circle w-40 h-40 text-sm font-semibold hover:scale-110"
          >
            Get in touch
          </Link>
        </div>

        {/* Bottom bar */}
        <div className={`border-t ${borderColor} pt-6 flex flex-col md:flex-row justify-between items-center gap-4`}>
          <div className="flex items-center gap-6">
            <span className={`text-xs ${textMuted}`}>VERSION</span>
            <span className={`text-xs ${textMain}`}>v.2025.1</span>
          </div>
          <div className="flex items-center gap-6">
            <span className={`text-xs ${textMuted}`}>LOCAL TIME</span>
            <span className={`text-xs ${textMain}`}>{time}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className={`text-xs ${textMuted}`}>SOCIALS</span>
            <div className="flex gap-4">
              {["GitHub", "LinkedIn", "Instagram"].map((s) => (
                <a key={s} href="#" className={`text-xs link-underline ${textMain}`}>
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
