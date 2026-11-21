import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, User, Calendar, DollarSign, Truck, Copy, Sparkles } from "lucide-react";
import FreightLayout from "@/components/freight/FreightLayout";
import FreightHeader from "@/components/freight/FreightHeader";
import StatusBadge from "@/components/freight/StatusBadge";
import TimelineItem from "@/components/freight/TimelineItem";
import { mockFreights, mockAlerts, incidentLabels } from "@/data/freightData";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const FreightDetail = () => {
  const { id } = useParams();
  const freight = mockFreights.find((f) => f.id === id);
  const [showReport, setShowReport] = useState(false);
  const pendingAlerts = mockAlerts.filter((a) => !a.resolved).length;

  if (!freight) {
    return (
      <FreightLayout>
        <FreightHeader alertCount={0} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-zinc-500">Frete não encontrado.</p>
          <Link to="/dashboard" className="text-white hover:underline text-sm mt-2 inline-block">Voltar ao Dashboard</Link>
        </div>
      </FreightLayout>
    );
  }

  const eta = new Date(freight.eta);
  const reportText = `📦 Relatório de Frete — ${freight.code}\n\nOrigem: ${freight.origin}\nDestino: ${freight.destination}\nStatus: ${freight.status === "entregue" ? "Entregue" : freight.status === "em_transito" ? "Em trânsito" : freight.status === "atrasado" ? "Atrasado" : "Crítico"}\nPrevisão: ${eta.toLocaleDateString("pt-BR")} às ${eta.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\nTransportadora: ${freight.carrier}\nProgresso: ${freight.progress}%\n\n${freight.incidents.length > 0 ? "⚠️ Incidentes:\n" + freight.incidents.map((i) => `- ${incidentLabels[i.type]}: ${i.description}`).join("\n") : "✅ Sem incidentes registrados."}\n\nAtualizado em: ${new Date().toLocaleString("pt-BR")}`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    toast.success("Relatório copiado!");
  };

  return (
    <FreightLayout>
      <FreightHeader alertCount={pendingAlerts} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-white">{freight.code}</h1>
              <StatusBadge status={freight.status} />
            </div>
            <p className="text-xs text-zinc-500">{freight.carrier} • {freight.client}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: MapPin, label: "Origem", value: freight.origin },
            { icon: MapPin, label: "Destino", value: freight.destination },
            { icon: User, label: "Cliente", value: freight.client },
            { icon: Calendar, label: "ETA", value: eta.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 shadow-lg shadow-black/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{item.label}</span>
              </div>
              <p className="text-sm font-semibold truncate text-white">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress + value */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 shadow-lg shadow-black/20">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Progresso</span>
              <span className="font-bold text-white">{freight.progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${freight.progress}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between shadow-lg shadow-black/20">
            <div className="flex items-center gap-2 text-zinc-400">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Valor</span>
            </div>
            <span className="text-lg font-bold text-white">R$ {freight.value.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        {/* AI Prediction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3 backdrop-blur-sm"
        >
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Previsão IA</p>
            <p className="text-xs text-zinc-400 mt-1">
              Com base no histórico e condições atuais, a probabilidade de entrega no prazo é de{" "}
              <span className="font-bold text-white">{freight.status === "critico" ? "23%" : freight.status === "atrasado" ? "58%" : "92%"}</span>.
              {freight.incidents.length > 0 && " Incidentes ativos podem impactar o prazo estimado."}
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div>
          <h2 className="text-sm font-bold mb-4 text-white">Histórico de Rastreamento</h2>
          <div>
            {freight.timeline.map((event, i) => (
              <TimelineItem key={event.id} event={event} isLast={i === freight.timeline.length - 1} index={i} />
            ))}
          </div>
        </div>

        {/* Incidents */}
        {freight.incidents.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3 text-white">Incidentes</h2>
            <div className="space-y-2">
              {freight.incidents.map((incident) => (
                <div key={incident.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-500">{incidentLabels[incident.type]}</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(incident.timestamp).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{incident.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Report */}
        <Button onClick={() => setShowReport(true)} variant="outline" className="w-full border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 rounded-full h-10">
          <Truck className="w-4 h-4 mr-2" /> Gerar Relatório Cliente
        </Button>

        {showReport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 shadow-lg shadow-black/20"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Relatório do Cliente</h3>
              <Button size="sm" variant="ghost" onClick={handleCopyReport} className="text-zinc-400 hover:text-white hover:bg-white/5">
                <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
              </Button>
            </div>
            <pre className="text-xs text-zinc-400 whitespace-pre-wrap bg-black/50 rounded-xl p-3 font-mono border border-white/5">
              {reportText}
            </pre>
          </motion.div>
        )}
      </main>
    </FreightLayout>
  );
};

export default FreightDetail;