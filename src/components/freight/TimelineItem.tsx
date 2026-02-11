import { TimelineEvent } from "@/data/freightData";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface TimelineItemProps {
  event: TimelineEvent;
  isLast: boolean;
  index: number;
}

const TimelineItem = ({ event, isLast, index }: TimelineItemProps) => {
  const date = new Date(event.date);
  const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-freight-primary/15 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-freight-primary" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-1" />}
      </div>
      <div className="pb-6">
        <p className="text-sm font-semibold text-foreground">{event.city}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{event.status}</p>
        <p className="text-xs text-muted-foreground/70">{event.description}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">{dateStr} às {timeStr}</p>
      </div>
    </motion.div>
  );
};

export default TimelineItem;
