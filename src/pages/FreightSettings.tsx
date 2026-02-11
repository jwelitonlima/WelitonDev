import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Link2, Sliders } from "lucide-react";
import FreightHeader from "@/components/freight/FreightHeader";
import { mockAlerts } from "@/data/freightData";

const carriers = [
  { name: "Correios", logo: "📦", enabled: true },
  { name: "Loggi", logo: "🚛", enabled: true },
  { name: "Jadlog", logo: "📬", enabled: false },
  { name: "Total Express", logo: "🏷️", enabled: true },
];

const FreightSettings = () => {
  const pendingAlerts = mockAlerts.filter((a) => !a.resolved).length;

  const [rules, setRules] = useState({
    noUpdateTime: 6,
    stopTime: 4,
    delayMargin: 2,
  });

  const [carrierState, setCarrierState] = useState(carriers.map((c) => ({ ...c })));
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    critical: true,
  });

  const toggleCarrier = (index: number) => {
    setCarrierState((prev) =>
      prev.map((c, i) => (i === index ? { ...c, enabled: !c.enabled } : c))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <FreightHeader alertCount={pendingAlerts} />

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-8">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">Configurações</h1>
        </div>

        {/* Monitoring Rules */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sliders className="w-4 h-4 text-freight-primary" />
            <h2 className="text-sm font-bold">Regras de Monitoramento</h2>
          </div>

          <div className="space-y-6">
            {[
              { key: "noUpdateTime" as const, label: "Tempo sem atualização (horas)", min: 1, max: 24 },
              { key: "stopTime" as const, label: "Tempo máximo de parada (horas)", min: 1, max: 12 },
              { key: "delayMargin" as const, label: "Margem de atraso (horas)", min: 0.5, max: 8, step: 0.5 },
            ].map((rule) => (
              <div key={rule.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-foreground">{rule.label}</label>
                  <span className="text-sm font-bold text-freight-primary">{rules[rule.key]}h</span>
                </div>
                <input
                  type="range"
                  min={rule.min}
                  max={rule.max}
                  step={rule.step || 1}
                  value={rules[rule.key]}
                  onChange={(e) => setRules((prev) => ({ ...prev, [rule.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-freight-primary h-1.5"
                  aria-label={rule.label}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{rule.min}h</span>
                  <span>{rule.max}h</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Carrier Integrations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Link2 className="w-4 h-4 text-freight-primary" />
            <h2 className="text-sm font-bold">Integrações com Transportadoras</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {carrierState.map((carrier, i) => (
              <button
                key={carrier.name}
                onClick={() => toggleCarrier(i)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  carrier.enabled
                    ? "border-freight-primary/30 bg-freight-primary/5"
                    : "border-border bg-card opacity-60"
                }`}
                aria-label={`Toggle ${carrier.name}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{carrier.logo}</span>
                  <span className="text-sm font-medium">{carrier.name}</span>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    carrier.enabled ? "bg-freight-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      carrier.enabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Notification Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-freight-primary" />
            <h2 className="text-sm font-bold">Preferências de Notificação</h2>
          </div>

          <div className="space-y-3">
            {[
              { key: "email" as const, label: "Notificações por E-mail" },
              { key: "push" as const, label: "Notificações Push" },
              { key: "sms" as const, label: "Notificações por SMS" },
              { key: "critical" as const, label: "Apenas alertas críticos" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <span className="text-sm">{item.label}</span>
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="w-4 h-4 accent-freight-primary rounded"
                />
              </label>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default FreightSettings;
