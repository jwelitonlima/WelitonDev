import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit, CheckCircle2, AlertTriangle, Send, Loader2 } from "lucide-react";
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
    try {
      const response = await analyzeFreightsWithAgent(freights);
      
      if (response.logs && response.logs.length > 0) {
        setLogs(response.logs);
        toast.success("Análise concluída! Agente IA disparou alertas no Telegram.");
      } else {
        toast.info(response.message);
      }
    } catch (error) {
      toast.error("Falha ao conectar com o Agente IA. Verifique o n8n.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critico": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "alto": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medio": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-freight-primary/20 bg-card/50 backdrop-blur-sm p-5 shadow-lg shadow-freight-primary/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-freight-primary/20 text-freight-primary">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Agente Autônomo (Groq + Llama 3)</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monitoramento em Tempo Real</p>
          </div>
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          size="sm"
          className="bg-freight-primary hover:bg-freight-primary/90 text-white gap-2"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAnalyzing ? "Analisando..." : "Analisar Fretes com IA"}
        </Button>
      </div>

      <div className="space-y-3 mt-4">
        <AnimatePresence>
          {logs.length === 0 && !isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg"
            >
              Nenhuma ação recente. Clique em "Analisar Fretes com IA" para iniciar.
            </motion.div>
          )}

          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg border border-border bg-background flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-foreground">{log.freightCode}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${getRiskColor(log.riskLevel)}`}>
                    Risco {log.riskLevel}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                </span>
              </div>
              
              <div className="flex items-start gap-2 text-xs">
                <BrainCircuit className="w-3.5 h-3.5 text-freight-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground"><strong className="text-foreground">Análise:</strong> {log.reasoning}</p>
              </div>
              
              <div className="flex items-start gap-2 text-xs">
                {log.actionTaken.includes("Telegram") ? (
                  <Send className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                )}
                <p className="text-muted-foreground"><strong className="text-foreground">Ação:</strong> {log.actionTaken}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AgentPanel;