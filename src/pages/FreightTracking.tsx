import { useState } from "react";
import { motion } from "framer-motion";
import FreightHeader from "@/components/freight/FreightHeader";
import FreteListItem from "@/components/freight/FreteListItem";
import StatusBadge from "@/components/freight/StatusBadge";
import { mockFreights, FreightItem, mockAlerts } from "@/data/freightData";
import { MapPin, Navigation, Clock, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  em_transito: "#3B82F6",
  entregue: "#10B981",
  atrasado: "#F59E0B",
  critico: "#EF4444",
  aguardando: "#94A3B8",
};

const FreightTracking = () => {
  const [selectedFreight, setSelectedFreight] = useState<FreightItem | null>(null);
  const pendingAlerts = mockAlerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-screen bg-background">
      <FreightHeader alertCount={pendingAlerts} />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
        {/* Map area */}
        <div className="flex-1 relative bg-muted/30 overflow-hidden">
          {/* Simulated map */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted">
            <svg viewBox="0 0 800 600" className="w-full h-full opacity-20" aria-hidden="true">
              <path d="M100,300 Q200,100 400,200 T700,300" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M150,400 Q300,200 500,350 T750,250" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>

            {/* Freight markers */}
            {mockFreights.filter(f => f.status !== "entregue").map((freight) => {
              const x = ((freight.lng + 75) / 50) * 100;
              const y = ((freight.lat + 35) / 40) * 100;
              const isSelected = selectedFreight?.id === freight.id;
              return (
                <motion.button
                  key={freight.id}
                  onClick={() => setSelectedFreight(freight)}
                  className="absolute"
                  style={{ left: `${Math.min(Math.max(x, 5), 90)}%`, top: `${Math.min(Math.max(y, 5), 90)}%` }}
                  whileHover={{ scale: 1.3 }}
                  animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ repeat: isSelected ? Infinity : 0, duration: 1.5 }}
                  aria-label={`Frete ${freight.code}`}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: statusColors[freight.status] }}
                  />
                  {isSelected && (
                    <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: statusColors[freight.status] }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected freight popup */}
          {selectedFreight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 lg:left-4 lg:right-auto lg:w-80 bg-card rounded-xl border border-border p-4 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-mono font-bold">{selectedFreight.code}</code>
                <StatusBadge status={selectedFreight.status} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Navigation className="w-3.5 h-3.5 text-freight-primary" />
                  <span>{selectedFreight.origin} → {selectedFreight.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ETA: {new Date(selectedFreight.eta).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-3.5 h-3.5" />
                  <span>{selectedFreight.client} • {selectedFreight.carrier}</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progresso</span>
                    <span>{selectedFreight.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedFreight.progress}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-freight-primary"
                    />
                  </div>
                </div>
              </div>
              <a
                href={`/frete/${selectedFreight.id}`}
                className="block mt-3 text-center text-xs text-freight-primary hover:underline font-medium"
              >
                Mais Informações →
              </a>
            </motion.div>
          )}

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg border border-border p-3">
            <p className="text-xs font-semibold mb-2">Legenda</p>
            <div className="space-y-1.5">
              {[
                { color: "#3B82F6", label: "No prazo" },
                { color: "#F59E0B", label: "Atenção" },
                { color: "#EF4444", label: "Crítico" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto max-h-[40vh] lg:max-h-none">
          <div className="p-4">
            <h2 className="text-sm font-bold mb-3">Fretes ({mockFreights.length})</h2>
            <div className="space-y-2">
              {mockFreights.map((freight) => (
                <FreteListItem
                  key={freight.id}
                  freight={freight}
                  selected={selectedFreight?.id === freight.id}
                  onClick={setSelectedFreight}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightTracking;
