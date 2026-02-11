import { useState, useEffect, useCallback } from "react";
import { Truck, AlertTriangle, Bell, CheckCircle, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import FreightHeader from "@/components/freight/FreightHeader";
import MetricCard from "@/components/freight/MetricCard";
import AlertCard from "@/components/freight/AlertCard";
import { mockFreights, mockAlerts, deliveryChartData, generateRandomAlert, Alert } from "@/data/freightData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    toast.success("Alerta resolvido com sucesso!");
  }, []);

  const handleSimulate = useCallback(() => {
    const newAlert = generateRandomAlert();
    setAlerts((prev) => [newAlert, ...prev]);
    toast.info(`Novo alerta: ${newAlert.freightCode}`);
  }, []);

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate data refresh silently
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filters: { label: string; value: FilterType }[] = [
    { label: "Todos", value: "todos" },
    { label: "Críticos", value: "critica" },
    { label: "Alta", value: "alta" },
    { label: "Média", value: "media" },
    { label: "Baixa", value: "baixa" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FreightHeader alertCount={pendingAlerts} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <MetricCard title="Fretes Ativos" value={activeFreights} icon={Truck} color="primary" />
          <MetricCard title="Críticos" value={criticalFreights} icon={AlertTriangle} color="danger" />
          <MetricCard title="Alertas" value={pendingAlerts} icon={Bell} color="warning" />
          <MetricCard title="Taxa Entrega" value={`${deliveryRate}%`} icon={CheckCircle} color="success" />
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-xl border border-border bg-card p-4 md:p-6"
        >
          <h2 className="text-sm font-semibold mb-4">Entregas — Últimos 7 dias</h2>
          <div className="h-52 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deliveryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="entregas" stroke="hsl(var(--freight-primary))" strokeWidth={2} dot={{ r: 4 }} name="Realizadas" />
                <Line type="monotone" dataKey="previsao" stroke="hsl(var(--freight-success))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Previsão" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Alerts Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold">Alertas em Tempo Real</h2>
            <Button size="sm" variant="outline" onClick={handleSimulate}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Simular Alerta
            </Button>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-freight-primary/30"
                aria-label="Buscar fretes"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    filter === f.value
                      ? "bg-freight-primary text-white border-freight-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alert List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onResolve={handleResolve} />
              ))}
            </AnimatePresence>
            {filteredAlerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Nenhum alerta encontrado.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreightDashboard;
