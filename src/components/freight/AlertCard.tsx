import { useState } from "react";
import { ChevronDown, CheckCircle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, incidentLabels } from "@/data/freightData";
import StatusBadge from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AlertCardProps {
  alert: Alert;
  onResolve: (id: string) => void;
}

const AlertCard = ({ alert, onResolve }: AlertCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className={cn(
        "rounded-xl border bg-card p-4 transition-shadow",
        alert.priority === "critica" && "border-freight-danger/40 shadow-[0_0_15px_-3px] shadow-freight-danger/20",
        alert.priority === "alta" && "border-freight-warning/30",
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 text-left"
        aria-expanded={expanded}
        aria-label={`Alerta ${alert.freightCode}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <code className="text-sm font-mono font-semibold text-foreground shrink-0">{alert.freightCode}</code>
          <span className="text-xs text-muted-foreground hidden sm:inline truncate">{incidentLabels[alert.type]}</span>
          <StatusBadge priority={alert.priority} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden md:inline">{timeAgo}</span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border space-y-3">
              <p className="text-sm text-foreground/80">{alert.description}</p>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Ação Sugerida pela IA</p>
                <p className="text-sm text-foreground/90">{alert.suggestedAction}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onResolve(alert.id)} className="bg-freight-success hover:bg-freight-success/90 text-white">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolver
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate(`/frete/${alert.freightId}`)}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Ver Detalhes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export default AlertCard;
