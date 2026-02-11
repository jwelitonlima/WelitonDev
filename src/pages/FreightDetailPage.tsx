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
        <FreightHeader alertCount={0} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Frete não encontrado.</p>
          <Link to="/dashboard" className="text-freight-primary hover:underline text-sm mt-2 inline-block">Voltar ao Dashboard</Link>
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
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono">{freight.code}</h1>
              <StatusBadge status={freight.status} />
            </div>
            <p className="text-xs text-muted-foreground">{freight.carrier} • {freight.client}</p>
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
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</span>
              </div>
              <p className="text-sm font-semibold truncate">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress + value */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-bold">{freight.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${freight.progress}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-freight-primary"
              />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Valor</span>
            </div>
            <span className="text-lg font-bold">R$ {freight.value.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        {/* AI Prediction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-freight-primary/20 bg-freight-primary/5 p-4 flex items-start gap-3"
        >
          <Sparkles className="w-5 h-5 text-freight-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Previsão IA</p>
            <p className="text-xs text-muted-foreground mt-1">
              Com base no histórico e condições atuais, a probabilidade de entrega no prazo é de{" "}
              <span className="font-bold text-foreground">{freight.status === "critico" ? "23%" : freight.status === "atrasado" ? "58%" : "92%"}</span>.
              {freight.incidents.length > 0 && " Incidentes ativos podem impactar o prazo estimado."}
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div>
          <h2 className="text-sm font-bold mb-4">Histórico de Rastreamento</h2>
          <div>
            {freight.timeline.map((event, i) => (
              <TimelineItem key={event.id} event={event} isLast={i === freight.timeline.length - 1} index={i} />
            ))}
          </div>
        </div>

        {/* Incidents */}
        {freight.incidents.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3">Incidentes</h2>
            <div className="space-y-2">
              {freight.incidents.map((incident) => (
                <div key={incident.id} className="rounded-lg border border-freight-danger/20 bg-freight-danger/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-freight-danger">{incidentLabels[incident.type]}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(incident.timestamp).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{incident.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Report */}
        <Button onClick={() => setShowReport(true)} variant="outline" className="w-full">
          <Truck className="w-4 h-4 mr-2" /> Gerar Relatório Cliente
        </Button>

        {showReport && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Relatório do Cliente</h3>
              <Button size="sm" variant="ghost" onClick={handleCopyReport}>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
              </Button>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3 font-mono">
              {reportText}
            </pre>
          </motion.div>
        )}
      </main>
    </FreightLayout>
  );
};

export default FreightDetail;
