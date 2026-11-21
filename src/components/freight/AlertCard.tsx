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

  const isCritical = alert.priority === "critica";
  const isHigh = alert.priority === "alta";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className={cn(
        "rounded-lg border bg-background/50 transition-all overflow-hidden relative",
        isCritical ? "border-red-500/20" : isHigh ? "border-amber-500/20" : "border-border/50"
      )}
    >
      {/* Linha lateral indicativa (estilo Linear) */}
      {(isCritical || isHigh) && (
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-0.5",
          isCritical ? "bg-red-500" : "bg-amber-500"
        )} />
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 text-left p-4 pl-5"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <code className="text-xs font-mono font-medium text-foreground shrink-0">{alert.freightCode}</code>
          <span className="text-[11px] text-muted-foreground hidden sm:inline truncate">{incidentLabels[alert.type]}</span>
          <StatusBadge priority={alert.priority} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-muted-foreground hidden md:inline tabular-nums">{timeAgo}</span>
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
            <div className="px-5 pb-4 pt-0 space-y-3">
              <p className="text-sm text-muted-foreground">{alert.description}</p>
              <div className="bg-muted/30 rounded-md p-3 border border-border/20">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Ação Sugerida pela IA</p>
                <p className="text-sm text-foreground/80">{alert.suggestedAction}</p>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={() => onResolve(alert.id)} className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-4 h-8 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Resolver
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate(`/frete/${alert.freightId}`)} className="rounded-full px-4 h-8 text-xs border-border/50">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Ver Detalhes
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