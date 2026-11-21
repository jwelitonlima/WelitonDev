import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FreightLayout from "@/components/freight/FreightLayout";
import FreightHeader from "@/components/freight/FreightHeader";
import FreteListItem from "@/components/freight/FreteListItem";
import StatusBadge from "@/components/freight/StatusBadge";
import { mockFreights, FreightItem, mockAlerts } from "@/data/freightData";
import { Navigation, Clock, Package, Search, Layers } from "lucide-react";

const statusColors: Record<string, string> = {
  em_transito: "#FFFFFF",
  entregue: "#10B981",
  atrasado: "#F59E0B",
  critico: "#EF4444",
  aguardando: "#94A3B8",
};

const BRAZIL_PATH = "M180,60 L220,55 L260,50 L300,45 L340,48 L380,55 L410,70 L430,90 L440,120 L445,160 L440,200 L435,240 L425,280 L410,320 L390,360 L365,390 L340,410 L310,425 L280,435 L250,440 L220,438 L190,430 L165,415 L145,395 L130,370 L120,340 L115,310 L110,280 L112,240 L118,200 L130,160 L145,120 L160,90 Z";

const FreightTracking = () => {
  const [selectedFreight, setSelectedFreight] = useState<FreightItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pendingAlerts = mockAlerts.filter((a) => !a.resolved).length;

  const filteredFreights = mockFreights.filter(
    (f) => !searchQuery || f.code.toLowerCase().includes(searchQuery.toLowerCase()) || f.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FreightLayout>
      <FreightHeader alertCount={pendingAlerts} />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
        {/* Map area */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#050505]">
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />

            {/* Brazil outline */}
            <svg viewBox="0 0 550 500" className="absolute inset-0 w-full h-full" aria-hidden="true">
              <motion.path
                d={BRAZIL_PATH}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeOpacity="0.1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </svg>

            {/* Freight markers - Fórmula de posicionamento corrigida e segura */}
            {mockFreights.filter(f => f.status !== "entregue").map((freight) => {
              // Fórmula ajustada para garantir que os pinos fiquem entre 10% e 90% da tela
              const x = Math.min(Math.max(((freight.lng + 75) / 50) * 100, 10), 90);
              const y = Math.min(Math.max(((freight.lat + 35) / 40) * 100, 10), 90);
              
              const isSelected = selectedFreight?.id === freight.id;
              return (
                <motion.button
                  key={freight.id}
                  onClick={() => setSelectedFreight(freight)}
                  className="absolute group z-10"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  whileHover={{ scale: 1.2 }}
                  aria-label={`Frete ${freight.code}`}
                >
                  {(isSelected || freight.status === "critico") && (
                    <div className="absolute -inset-2 rounded-full animate-ping opacity-20"
                      style={{ backgroundColor: statusColors[freight.status] }}
                    />
                  )}
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all bg-[#050505]"
                    style={{
                      borderColor: statusColors[freight.status],
                      backgroundColor: isSelected ? statusColors[freight.status] : "#050505",
                      boxShadow: `0 0 12px ${statusColors[freight.status]}60`,
                    }}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111] text-[10px] px-2 py-1 rounded-md border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl font-mono text-white">
                    {freight.code}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Selected freight popup */}
          {selectedFreight && (
            <motion.div
              key={selectedFreight.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute bottom-4 left-4 right-4 lg:left-4 lg:right-auto lg:w-[340px] bg-[#0A0A0A]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl z-30"
            >
              <div className="flex items-center justify-between mb-3">
                <code className="text-sm font-mono font-bold text-white">{selectedFreight.code}</code>
                <StatusBadge status={selectedFreight.status} />
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-zinc-400">
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedFreight.origin} → {selectedFreight.destination}</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>ETA: {new Date(selectedFreight.eta).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-400">
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedFreight.client} • {selectedFreight.carrier}</span>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                    <span>Progresso</span>
                    <span className="font-mono font-medium text-white">{selectedFreight.progress}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedFreight.progress}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>
                </div>
              </div>
              <Link
                to={`/frete/${selectedFreight.id}`}
                className="block mt-4 text-center text-xs bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl font-medium transition-colors border border-white/5"
              >
                Ver Detalhes Completos →
              </Link>
            </motion.div>
          )}

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-4 left-4 bg-[#0A0A0A]/80 backdrop-blur-xl rounded-xl border border-white/10 p-3 z-20"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <p className="text-xs font-medium text-white">Legenda</p>
            </div>
            <div className="space-y-2">
              {[
                { color: "#FFFFFF", label: "No prazo" },
                { color: "#F59E0B", label: "Atenção" },
                { color: "#EF4444", label: "Crítico" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: item.color }}>
                    <div className="w-0.5 h-0.5 rounded-full m-0.5" style={{ backgroundColor: item.color }} />
                  </div>
                  <span className="text-[11px] text-zinc-400">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute top-4 right-4 bg-[#0A0A0A]/80 backdrop-blur-xl rounded-xl border border-white/10 p-3 z-20"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-semibold text-white">{mockFreights.filter(f => f.status === "em_transito").length}</p>
                <p className="text-[10px] text-zinc-500">Em trânsito</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-red-500">{mockFreights.filter(f => f.status === "critico").length}</p>
                <p className="text-[10px] text-zinc-500">Críticos</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0A0A0A] overflow-y-auto max-h-[40vh] lg:max-h-none z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Fretes ({filteredFreights.length})</h2>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar frete..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20 text-white placeholder:text-zinc-500"
                aria-label="Buscar frete"
              />
            </div>
            <div className="space-y-2">
              {filteredFreights.map((freight) => (
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
    </FreightLayout>
  );
};

export default FreightTracking;