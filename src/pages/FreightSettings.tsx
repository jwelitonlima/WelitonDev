import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Link2, Sliders, Send, Package, Truck, Mail, Briefcase } from "lucide-react";
import FreightLayout from "@/components/freight/FreightLayout";
import FreightHeader from "@/components/freight/FreightHeader";
import { mockAlerts } from "@/data/freightData";
import { toast } from "sonner";

const carriers = [
  { name: "Correios", icon: Mail, enabled: true },
  { name: "Loggi", icon: Truck, enabled: true },
  { name: "Jadlog", icon: Package, enabled: false },
  { name: "Total Express", icon: Briefcase, enabled: true },
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
    telegram: true, 
    critical: true,
  });

  const toggleCarrier = (index: number) => {
    setCarrierState((prev) =>
      prev.map((c, i) => (i === index ? { ...c, enabled: !c.enabled } : c))
    );
    toast.success("Integração atualizada", {
      className: "bg-zinc-900 border-zinc-800 text-white",
    });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <FreightLayout>
      <FreightHeader alertCount={pendingAlerts} />

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-zinc-400" />
          <h1 className="text-2xl font-semibold tracking-tight text-white">Configurações</h1>
        </div>

        {/* Monitoring Rules */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Sliders className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Regras de Monitoramento</h2>
          </div>

          <div className="space-y-8">
            {[
              { key: "noUpdateTime" as const, label: "Tempo sem atualização (horas)", min: 1, max: 24 },
              { key: "stopTime" as const, label: "Tempo máximo de parada (horas)", min: 1, max: 12 },
              { key: "delayMargin" as const, label: "Margem de atraso (horas)", min: 0.5, max: 8, step: 0.5 },
            ].map((rule) => (
              <div key={rule.key}>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-zinc-400">{rule.label}</label>
                  <span className="text-sm font-semibold text-white bg-white/10 px-2 py-0.5 rounded-md font-mono">{rules[rule.key]}h</span>
                </div>
                <input
                  type="range"
                  min={rule.min}
                  max={rule.max}
                  step={rule.step || 1}
                  value={rules[rule.key]}
                  onChange={(e) => setRules((prev) => ({ ...prev, [rule.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-white h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  aria-label={rule.label}
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-2">
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
          className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Link2 className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Integrações com Transportadoras</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {carrierState.map((carrier, i) => {
              const Icon = carrier.icon;
              return (
                <button
                  key={carrier.name}
                  onClick={() => toggleCarrier(i)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    carrier.enabled
                      ? "border-white/10 bg-white/5"
                      : "border-transparent bg-transparent opacity-50 hover:opacity-100 hover:bg-white/5"
                  }`}
                  aria-label={`Toggle ${carrier.name}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                      carrier.enabled ? "bg-white/10 border-white/10" : "bg-transparent border-white/5"
                    }`}>
                      <Icon className={`w-4 h-4 ${carrier.enabled ? "text-white" : "text-zinc-500"}`} />
                    </div>
                    <span className={`text-sm font-medium ${carrier.enabled ? "text-white" : "text-zinc-400"}`}>
                      {carrier.name}
                    </span>
                  </div>
                  
                  {/* Toggle Estilo Apple (Verde Ativado, Cinza Desativado) */}
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                      carrier.enabled ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`w-5 h-5 rounded-full shadow-md bg-white mx-0.5 ${
                        carrier.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Notification Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Bell className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Preferências de Notificação</h2>
          </div>

          <div className="space-y-1">
            {[
              { key: "email" as const, label: "Notificações por E-mail", icon: Mail },
              { key: "push" as const, label: "Notificações Push", icon: Bell },
              { key: "telegram" as const, label: "Alertas via Telegram", icon: Send },
              { key: "critical" as const, label: "Apenas alertas críticos", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = notifications[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleNotification(item.key)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5 group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span className={`text-sm transition-colors ${isActive ? "text-white" : "text-zinc-400"}`}>{item.label}</span>
                  </div>
                  
                  {/* Toggle Estilo Apple */}
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                      isActive ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`w-5 h-5 rounded-full shadow-md bg-white mx-0.5 ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </main>
    </FreightLayout>
  );
};

export default FreightSettings;