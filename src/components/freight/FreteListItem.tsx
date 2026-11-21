import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { FreightItem, statusLabels } from "@/data/freightData";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";

interface FreteListItemProps {
  freight: FreightItem;
  selected: boolean;
  onClick: (freight: FreightItem) => void;
}

const FreteListItem = ({ freight, selected, onClick }: FreteListItemProps) => {
  return (
    <button
      onClick={() => onClick(freight)}
      className={cn(
        "w-full text-left p-3 rounded-2xl border transition-all duration-300 group",
        selected
          ? "border-white/20 bg-white/10"
          : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <code className={cn(
          "text-xs font-mono font-bold transition-colors",
          selected ? "text-white" : "text-zinc-300 group-hover:text-white"
        )}>
          {freight.code}
        </code>
        <StatusBadge status={freight.status} className="text-[9px] px-2 py-0 shrink-0" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {freight.origin.split(",")[0]} → {freight.destination.split(",")[0]}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Clock className="w-3 h-3 shrink-0" />
          <span>
            ETA: {new Date(freight.eta).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </button>
  );
};

export default FreteListItem;