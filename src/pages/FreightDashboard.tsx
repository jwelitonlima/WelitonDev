import { useState, useEffect, useCallback } from "react";
import { Truck, AlertTriangle, Bell, CheckCircle, Plus, Search, Zap, BarChart3, ArrowUpRight } from "lucide-react";
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
    toast.success("Alerta resolvido com sucesso!", { description: "O status foi atualizado." });
  }, []);

  const handleSimulate = useCallback(() => {
    const newAlert = generateRandomAlert();
    setAlerts((prev) => [newAlert, ...prev]);
    toast("🚨 Novo alerta detectado", { description: `Frete ${newAlert.freightCode} requer atenção.` });
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

      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Painel de Controle
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monitoramento inteligente de {mockFreights.length} fretes ativos
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSimulate} className="border-border/50">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-freight-warning" /> Simular Alerta
            </Button>
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <MetricCard title="Fretes Ativos" value={activeFreights} icon={Truck} color="primary" delay={0} trend={{ value: 12, label: "vs ontem" }} />
          <MetricCard title="Fretes Críticos" value={criticalFreights} icon={AlertTriangle} color="danger" delay={0.05} trend={{ value: -25, label: "vs ontem" }} />
          <MetricCard title="Alertas Pendentes" value={pendingAlerts} icon={Bell} color="warning" delay={0.1} />
          <MetricCard title="Taxa de Entrega" value={deliveryRate} displayValue={`${deliveryRate}%`} icon={CheckCircle} color="success" delay={0.15} trend={{ value: 5, label: "vs semana" }} />
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-freight-primary" />
                  <h2 className="text-sm font-semibold">Performance de Entregas</h2>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Últimos 7 dias</span>
              </div>
              <div className="h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={deliveryChartData}>
                    <defs>
                      <linearGradient id="colorEntregas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--freight-primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--freight-primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPrevisao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--freight-success))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--freight-success))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border) / 0.5)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)",
                      }}
                    />
                    <Area type="monotone" dataKey="previsao" stroke="hsl(var(--freight-success))" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPrevisao)" name="Previsão" />
                    <Area type="monotone" dataKey="entregas" stroke="hsl(var(--freight-primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEntregas)" name="Realizadas" dot={{ r: 3, fill: "hsl(var(--freight-primary))", strokeWidth: 0 }} activeDot={{ r: 5, stroke: "hsl(var(--freight-primary))", strokeWidth: 2, fill: "hsl(var(--card))" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Alerts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-freight-danger opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-freight-danger" />
                  </div>
                  <h2 className="text-base font-bold">Alertas em Tempo Real</h2>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por código..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freight-primary/20 focus:border-freight-primary/30 transition-all"
                    aria-label="Buscar fretes"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {filters.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`px-3 py-2 text-xs rounded-xl border transition-all ${
                        filter === f.value
                          ? "bg-freight-primary text-white border-freight-primary shadow-lg shadow-freight-primary/20"
                          : "bg-card/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      {f.label}
                      {f.count ? (
                        <span className={`ml-1.5 text-[10px] ${filter === f.value ? "opacity-80" : "opacity-50"}`}>
                          {f.count}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {filteredAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onResolve={handleResolve} />
                  ))}
                </AnimatePresence>
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-sm rounded-2xl border border-border/30 bg-card/30">
                    ✅ Nenhum alerta pendente nesta categoria
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Active freights mini list */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Fretes Recentes</h3>
                <Link to="/rastreamento" className="text-[10px] text-freight-primary hover:underline flex items-center gap-0.5">
                  Ver todos <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {mockFreights.slice(0, 5).map((freight, i) => (
                  <motion.div
                    key={freight.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <Link
                      to={`/frete/${freight.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/30 transition-colors group"
                    >
                      <div className="min-w-0">
                        <code className="text-xs font-mono font-semibold group-hover:text-freight-primary transition-colors">{freight.code}</code>
                        <p className="text-[10px] text-muted-foreground truncate">{freight.origin.split(",")[0]} → {freight.destination.split(",")[0]}</p>
                      </div>
                      <StatusBadge status={freight.status} className="text-[10px] px-2 py-0 shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4"
            >
              <h3 className="text-sm font-semibold mb-4">Por Transportadora</h3>
              {["Loggi", "Jadlog", "Correios", "Total Express"].map((carrier) => {
                const count = mockFreights.filter((f) => f.carrier === carrier).length;
                const pct = Math.round((count / mockFreights.length) * 100);
                return (
                  <div key={carrier} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{carrier}</span>
                      <span className="font-medium">{count} fretes</span>
                    </div>
                    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-freight-primary/60"
                      />
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* AI insight card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="rounded-2xl border border-freight-primary/20 bg-gradient-to-br from-freight-primary/5 to-transparent backdrop-blur-sm p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-freight-primary/15 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-freight-primary" />
                </div>
                <h3 className="text-sm font-semibold">Insight IA</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Padrão detectado: fretes na rota <span className="text-foreground font-medium">MG → BA</span> apresentam 
                <span className="text-freight-warning font-medium"> 3x mais atrasos</span> nas últimas 48h. 
                Recomendo priorizar monitoramento nesta região.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </FreightLayout>
  );
};

export default FreightDashboard;
