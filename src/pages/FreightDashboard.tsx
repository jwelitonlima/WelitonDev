import AgentPanel from "@/components/freight/AgentPanel";
import { useState, useEffect, useCallback } from "react";
import { Truck, AlertTriangle, Bell, CheckCircle, Search, Zap, BarChart3, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import FreightLayout from "@/components/freight/FreightLayout";
import FreightHeader from "@/components/freight/FreightHeader";
import MetricCard from "@/components/freight/MetricCard";
import AlertCard from "@/components/freight/AlertCard";
import StatusBadge from "@/components/freight/StatusBadge";
import { mockFreights, mockAlerts, deliveryChartData, generateRandomAlert, Alert } from "@/data/freightData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type FilterType = "todos" | "critica" | "alta" | "media" | "baixa";

const FreightDashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<FilterType>("todos");
  const [search, setSearch] = useState("");

  const activeFreights = mockFreights.filter((f) => f.status !== "entregue").length;
  const criticalFreights = mockFreights.filter((f) => f.status === "critico").length;
  const pendingAlerts = alerts.filter((a) => !a.resolved).length;
  const deliveryRate = Math.round((mockFreights.filter((f) => f.status === "entregue").length / mockFreights.length) * 100);

  const filteredAlerts = alerts
    .filter((a) => !a.resolved)
    .filter((a) => filter === "todos" || a.priority === filter)
    .filter((a) => !search || a.freightCode.toLowerCase().includes(search.toLowerCase()));

  const handleResolve = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    toast.success("Alerta resolvido", { description: "O status foi atualizado." });
  }, []);

  const handleSimulate = useCallback(() => {
    const newAlert = generateRandomAlert();
    setAlerts((prev) => [newAlert, ...prev]);
    toast("Novo alerta detectado", { description: `Frete ${newAlert.freightCode} requer atenção.` });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulated refresh
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filters: { label: string; value: FilterType; count?: number }[] = [
    { label: "Todos", value: "todos", count: alerts.filter((a) => !a.resolved).length },
    { label: "Críticos", value: "critica", count: alerts.filter((a) => !a.resolved && a.priority === "critica").length },
    { label: "Alta", value: "alta", count: alerts.filter((a) => !a.resolved && a.priority === "alta").length },
    { label: "Média", value: "media", count: alerts.filter((a) => !a.resolved && a.priority === "media").length },
    { label: "Baixa", value: "baixa", count: alerts.filter((a) => !a.resolved && a.priority === "baixa").length },
  ];

  return (
    <FreightLayout>
      <FreightHeader alertCount={pendingAlerts} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Painel de Controle
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Monitoramento inteligente de {mockFreights.length} fretes ativos
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSimulate} className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 rounded-full text-xs h-9 px-4 transition-colors">
              <Zap className="w-3.5 h-3.5 mr-2 text-amber-500" /> Simular Alerta
            </Button>
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Fretes Ativos" value={activeFreights} icon={Truck} color="primary" delay={0} trend={{ value: 12, label: "vs ontem" }} />
          <MetricCard title="Fretes Críticos" value={criticalFreights} icon={AlertTriangle} color="danger" delay={0.05} trend={{ value: -25, label: "vs ontem" }} />
          <MetricCard title="Alertas Pendentes" value={pendingAlerts} icon={Bell} color="warning" delay={0.1} />
          <MetricCard title="Taxa de Entrega" value={deliveryRate} displayValue={`${deliveryRate}%`} icon={CheckCircle} color="success" delay={0.15} trend={{ value: 5, label: "vs semana" }} />
        </div>

        {/* Agent Panel */}
        <AgentPanel freights={mockFreights} />

        {/* Main grid */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-8">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl shadow-black/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-medium text-white">Performance de Entregas</h2>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Últimos 7 dias</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={deliveryChartData}>
                    <defs>
                      <linearGradient id="colorEntregas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#09090b",
                        border: "1px solid #27272a",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Area type="monotone" dataKey="entregas" stroke="#FFFFFF" strokeWidth={2} fillOpacity={1} fill="url(#colorEntregas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Alerts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Alertas em Tempo Real</h2>
                </div>
              </div>

              {/* Filters + Search */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por código..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-white/10 bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20 text-white placeholder:text-zinc-500 transition-all"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {filters.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        filter === f.value
                          ? "bg-white text-black border-white"
                          : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {f.label}
                      {f.count ? (
                        <span className={`ml-1.5 text-[10px] ${filter === f.value ? "opacity-70 text-black" : "opacity-50"}`}>
                          {f.count}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onResolve={handleResolve} />
                  ))}
                </AnimatePresence>
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-12 text-zinc-500 text-sm rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    Nenhum alerta pendente nesta categoria
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-5 shadow-2xl shadow-black/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Fretes Recentes</h3>
                <Link to="/rastreamento" className="text-[10px] text-zinc-400 hover:text-white transition-colors flex items-center gap-0.5">
                  Ver todos <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-1">
                {mockFreights.slice(0, 5).map((freight, i) => (
                  <Link
                    key={freight.id}
                    to={`/frete/${freight.id}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="min-w-0">
                      <code className="text-xs font-mono font-medium text-white group-hover:text-zinc-300 transition-colors">{freight.code}</code>
                      <p className="text-[10px] text-zinc-500 truncate">{freight.origin.split(",")[0]} → {freight.destination.split(",")[0]}</p>
                    </div>
                    <StatusBadge status={freight.status} className="text-[9px] px-2 py-0 shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-5 shadow-2xl shadow-black/50"
            >
              <h3 className="text-sm font-medium text-white mb-4">Por Transportadora</h3>
              {["Loggi", "Jadlog", "Correios", "Total Express"].map((carrier) => {
                const count = mockFreights.filter((f) => f.carrier === carrier).length;
                const pct = Math.round((count / mockFreights.length) * 100);
                return (
                  <div key={carrier} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-zinc-400">{carrier}</span>
                      <span className="font-medium text-white">{count}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-white/40"
                      />
                    </div>
                  </div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-5 shadow-2xl shadow-black/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="text-sm font-medium text-white">Insight IA</h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Padrão detectado: fretes na rota <span className="text-white font-medium">MG → BA</span> apresentam 
                <span className="text-amber-500 font-medium"> 3x mais atrasos</span> nas últimas 48h.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </FreightLayout>
  );
};

export default FreightDashboard;