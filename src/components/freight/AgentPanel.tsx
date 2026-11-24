import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, AlertCircle, ArrowUpRight, Send, Loader2, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockFreights, FreightItem } from "@/data/freightData";
import { analyzeFreightsWithAgent, AgentActionLog } from "@/services/agentService";
import { toast } from "sonner";

interface AgentPanelProps {
  freights?: FreightItem[];
}

const AgentPanel = ({ freights = mockFreights }: AgentPanelProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<AgentActionLog[]>([]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setLogs([]); 
    try {
      const response = await analyzeFreightsWithAgent(freights);
      
      if (response.logs && response.logs.length > 0) {
        setLogs(response.logs);
        toast.success("Análise concluída", {
          description: "O Agente IA processou os dados e enviou os alertas.",
          className: "bg-background border-border text-foreground",
        });
      } else {
        toast.info(response.message, {
          description: "Nenhuma anomalia crítica detectada no momento.",
          className: "bg-background border-border text-foreground",
        });
      }
    } catch (error) {
      toast.error("O agente está offline no momento", {
        description: "O fluxo do n8n roda em um período de teste gratuito e pode estar desativado. O vídeo e o código do projeto mostram ele funcionando.",
        className: "bg-background border-destructive text-foreground",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case "critico": return "text-red-500 border-red-500/20 bg-red-500/5";
      case "alto": return "text-amber-500 border-amber-500/20 bg-amber-500/5";
      case "medio": return "text-blue-400 border-blue-400/20 bg-blue-400/5";
      default: return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden"
    >
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-border/40 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center border border-border/50">
            <Cpu className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Agente Autônomo</h2>
            <p className="text-xs text-muted-foreground">Monitoramento contínuo via Groq & GPT-OSS</p>
          </div>
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 transition-all font-medium h-9 px-5 rounded-full shadow-none"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2 fill-current" />
          )}
          {isAnalyzing ? "Processando..." : "Executar Análise"}
        </Button>
      </div>

      {/* Área de Logs */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-muted/20 animate-pulse border border-border/20" />
              ))}
            </motion.div>
          ) : logs.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-border flex items-center justify-center mb-4 bg-muted/10">
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground font-medium">Sistema em espera</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                Clique em executar para que o agente analise os fretes e dispare alertas proativos via Telegram.
              </p>
            </motion.div>
          ) : (
            <motion.div key="logs" className="space-y-3">
              {logs.map((log, index) => (
                <motion.div
                  key={log.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, ease: "easeOut" }}
                  className="group relative p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
                          {log.freightCode}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium uppercase tracking-wider ${getRiskStyles(log.riskLevel)}`}>
                          Risco {log.riskLevel}
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <strong className="text-foreground font-medium">Diagnóstico:</strong> {log.reasoning}
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5">
                        {log.actionTaken.toLowerCase().includes("telegram") ? (
                          <Send className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <strong className="text-foreground font-medium">Ação Executada:</strong> {log.actionTaken}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AgentPanel;