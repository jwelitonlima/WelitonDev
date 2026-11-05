export type FreightStatus = "em_transito" | "entregue" | "atrasado" | "critico" | "aguardando";
export type AlertPriority = "critica" | "alta" | "media" | "baixa";
export type IncidentType = "atraso" | "parada_prolongada" | "desvio_rota" | "avaria" | "sem_atualizacao" | "tentativa_entrega";

export interface FreightItem {
  id: string;
  code: string;
  origin: string;
  destination: string;
  client: string;
  status: FreightStatus;
  eta: string;
  value: number;
  carrier: string;
  lastUpdate: string;
  lat: number;
  lng: number;
  progress: number;
  timeline: TimelineEvent[];
  incidents: Incident[];
}

export interface TimelineEvent {
  id: string;
  city: string;
  date: string;
  status: string;
  description: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface Alert {
  id: string;
  freightCode: string;
  freightId: string;
  type: IncidentType;
  priority: AlertPriority;
  timestamp: string;
  description: string;
  suggestedAction: string;
  resolved: boolean;
}

export const statusLabels: Record<FreightStatus, string> = {
  em_transito: "Em Trânsito",
  entregue: "Entregue",
  atrasado: "Atrasado",
  critico: "Crítico",
  aguardando: "Aguardando",
};

export const priorityLabels: Record<AlertPriority, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const incidentLabels: Record<IncidentType, string> = {
  atraso: "Atraso na Entrega",
  parada_prolongada: "Parada Prolongada",
  desvio_rota: "Desvio de Rota",
  avaria: "Avaria na Carga",
  sem_atualizacao: "Sem Atualização",
  tentativa_entrega: "Tentativa de Entrega",
};

const now = new Date();
const fmt = (d: Date) => d.toISOString();
const hoursAgo = (h: number) => fmt(new Date(now.getTime() - h * 3600000));
const daysFromNow = (d: number) => fmt(new Date(now.getTime() + d * 86400000));

export const mockFreights: FreightItem[] = [
  {
    id: "1", code: "BR123456789", origin: "São Paulo, SP", destination: "Rio de Janeiro, RJ",
    client: "TechStore Ltda", status: "em_transito", eta: daysFromNow(1), value: 4500,
    carrier: "Loggi", lastUpdate: hoursAgo(1), lat: -22.9068, lng: -43.1729, progress: 72,
    timeline: [
      { id: "t1", city: "São Paulo, SP", date: hoursAgo(24), status: "Coletado", description: "Carga coletada no CD" },
      { id: "t2", city: "São José dos Campos, SP", date: hoursAgo(18), status: "Em trânsito", description: "Passagem pelo posto fiscal" },
      { id: "t3", city: "Volta Redonda, RJ", date: hoursAgo(6), status: "Em trânsito", description: "Chegada ao hub regional" },
      { id: "t4", city: "Rio de Janeiro, RJ", date: hoursAgo(1), status: "Saiu para entrega", description: "Em rota de entrega final" },
    ],
    incidents: [],
  },
  {
    id: "2", code: "BR987654321", origin: "Belo Horizonte, MG", destination: "Salvador, BA",
    client: "Farmácia Popular", status: "atrasado", eta: hoursAgo(-2), value: 8200,
    carrier: "Jadlog", lastUpdate: hoursAgo(4), lat: -12.9714, lng: -38.5124, progress: 58,
    timeline: [
      { id: "t1", city: "Belo Horizonte, MG", date: hoursAgo(72), status: "Coletado", description: "Coleta realizada" },
      { id: "t2", city: "Governador Valadares, MG", date: hoursAgo(48), status: "Em trânsito", description: "Hub de transferência" },
      { id: "t3", city: "Vitória da Conquista, BA", date: hoursAgo(12), status: "Em trânsito", description: "Parada para descanso" },
    ],
    incidents: [
      { id: "i1", type: "atraso", description: "Atraso de 6h devido a condições climáticas na BR-116", timestamp: hoursAgo(18), resolved: false },
    ],
  },
  {
    id: "3", code: "BR456789123", origin: "Curitiba, PR", destination: "Florianópolis, SC",
    client: "MegaShop Online", status: "em_transito", eta: daysFromNow(0.5), value: 3100,
    carrier: "Correios", lastUpdate: hoursAgo(2), lat: -26.3045, lng: -48.8487, progress: 85,
    timeline: [
      { id: "t1", city: "Curitiba, PR", date: hoursAgo(16), status: "Postado", description: "Objeto postado" },
      { id: "t2", city: "Joinville, SC", date: hoursAgo(8), status: "Em trânsito", description: "Em transferência" },
      { id: "t3", city: "Itajaí, SC", date: hoursAgo(2), status: "Em trânsito", description: "Saiu para entrega" },
    ],
    incidents: [],
  },
  {
    id: "4", code: "BR321654987", origin: "Manaus, AM", destination: "Belém, PA",
    client: "AmazonTech", status: "critico", eta: hoursAgo(-12), value: 15800,
    carrier: "Total Express", lastUpdate: hoursAgo(18), lat: -2.5307, lng: -44.2826, progress: 35,
    timeline: [
      { id: "t1", city: "Manaus, AM", date: hoursAgo(96), status: "Coletado", description: "Carga coletada" },
      { id: "t2", city: "Santarém, PA", date: hoursAgo(48), status: "Em trânsito", description: "Hub fluvial" },
    ],
    incidents: [
      { id: "i1", type: "sem_atualizacao", description: "Sem atualização há mais de 18 horas", timestamp: hoursAgo(18), resolved: false },
      { id: "i2", type: "parada_prolongada", description: "Veículo parado há 12 horas em local não identificado", timestamp: hoursAgo(12), resolved: false },
    ],
  },
  {
    id: "5", code: "BR654321789", origin: "Porto Alegre, RS", destination: "São Paulo, SP",
    client: "GauchaFoods", status: "em_transito", eta: daysFromNow(2), value: 6700,
    carrier: "Loggi", lastUpdate: hoursAgo(0.5), lat: -25.4284, lng: -49.2733, progress: 40,
    timeline: [
      { id: "t1", city: "Porto Alegre, RS", date: hoursAgo(12), status: "Coletado", description: "Coleta no armazém" },
      { id: "t2", city: "Florianópolis, SC", date: hoursAgo(4), status: "Em trânsito", description: "Passagem" },
    ],
    incidents: [],
  },
  {
    id: "6", code: "BR789123456", origin: "Recife, PE", destination: "Fortaleza, CE",
    client: "NordesteTech", status: "em_transito", eta: daysFromNow(1.5), value: 2900,
    carrier: "Jadlog", lastUpdate: hoursAgo(3), lat: -7.1195, lng: -34.845, progress: 55,
    timeline: [
      { id: "t1", city: "Recife, PE", date: hoursAgo(36), status: "Coletado", description: "Coleta realizada" },
      { id: "t2", city: "João Pessoa, PB", date: hoursAgo(24), status: "Em trânsito", description: "Em trânsito" },
      { id: "t3", city: "Natal, RN", date: hoursAgo(8), status: "Em trânsito", description: "Hub Natal" },
    ],
    incidents: [],
  },
  {
    id: "7", code: "BR147258369", origin: "Brasília, DF", destination: "Goiânia, GO",
    client: "CerradoDistribuidora", status: "entregue", eta: hoursAgo(2), value: 1800,
    carrier: "Correios", lastUpdate: hoursAgo(2), lat: -16.6869, lng: -49.2648, progress: 100,
    timeline: [
      { id: "t1", city: "Brasília, DF", date: hoursAgo(24), status: "Postado", description: "Objeto postado" },
      { id: "t2", city: "Anápolis, GO", date: hoursAgo(8), status: "Em trânsito", description: "Centro de triagem" },
      { id: "t3", city: "Goiânia, GO", date: hoursAgo(2), status: "Entregue", description: "Entregue ao destinatário" },
    ],
    incidents: [],
  },
  {
    id: "8", code: "BR369258147", origin: "Campinas, SP", destination: "Ribeirão Preto, SP",
    client: "InteriorLog", status: "em_transito", eta: daysFromNow(0.3), value: 2200,
    carrier: "Total Express", lastUpdate: hoursAgo(1.5), lat: -21.1767, lng: -47.8208, progress: 78,
    timeline: [
      { id: "t1", city: "Campinas, SP", date: hoursAgo(8), status: "Coletado", description: "Coleta realizada" },
      { id: "t2", city: "Piracicaba, SP", date: hoursAgo(4), status: "Em trânsito", description: "Em trânsito" },
    ],
    incidents: [],
  },
  {
    id: "9", code: "BR951753852", origin: "Vitória, ES", destination: "Belo Horizonte, MG",
    client: "CapixabaDist", status: "atrasado", eta: hoursAgo(-5), value: 5400,
    carrier: "Loggi", lastUpdate: hoursAgo(6), lat: -19.9167, lng: -43.9345, progress: 65,
    timeline: [
      { id: "t1", city: "Vitória, ES", date: hoursAgo(48), status: "Coletado", description: "Coleta no porto" },
      { id: "t2", city: "Governador Valadares, MG", date: hoursAgo(18), status: "Em trânsito", description: "Hub regional" },
    ],
    incidents: [
      { id: "i1", type: "desvio_rota", description: "Veículo desviou da rota principal na BR-381", timestamp: hoursAgo(10), resolved: false },
    ],
  },
  {
    id: "10", code: "BR852456159", origin: "Campo Grande, MS", destination: "Cuiabá, MT",
    client: "PantanalExpress", status: "aguardando", eta: daysFromNow(3), value: 7600,
    carrier: "Jadlog", lastUpdate: hoursAgo(1), lat: -20.4697, lng: -54.6201, progress: 0,
    timeline: [
      { id: "t1", city: "Campo Grande, MS", date: hoursAgo(1), status: "Aguardando coleta", description: "Aguardando coleta no CD" },
    ],
    incidents: [],
  },
];

export const mockAlerts: Alert[] = [
  {
    id: "a1", freightCode: "BR321654987", freightId: "4", type: "sem_atualizacao", priority: "critica",
    timestamp: hoursAgo(1), description: "Frete BR321654987 sem atualização de rastreamento há 18 horas. Última localização: Santarém, PA.",
    suggestedAction: "Contatar transportadora Total Express imediatamente. Verificar status do motorista e condições da via.", resolved: false,
  },
  {
    id: "a2", freightCode: "BR321654987", freightId: "4", type: "parada_prolongada", priority: "critica",
    timestamp: hoursAgo(0.5), description: "Veículo parado há 12 horas em local não identificado entre Santarém e Belém.",
    suggestedAction: "Acionar protocolo de segurança. Tentar contato via GPS e telefone do motorista.", resolved: false,
  },
  {
    id: "a3", freightCode: "BR987654321", freightId: "2", type: "atraso", priority: "alta",
    timestamp: hoursAgo(2), description: "Frete BR987654321 com atraso estimado de 6 horas devido a condições climáticas na BR-116.",
    suggestedAction: "Notificar cliente Farmácia Popular sobre novo ETA. Monitorar condições meteorológicas na região.", resolved: false,
  },
  {
    id: "a4", freightCode: "BR951753852", freightId: "9", type: "desvio_rota", priority: "alta",
    timestamp: hoursAgo(3), description: "Veículo do frete BR951753852 desviou da rota planejada na BR-381, próximo a Governador Valadares.",
    suggestedAction: "Verificar motivo do desvio com motorista. Pode ser bloqueio na estrada ou erro de GPS.", resolved: false,
  },
  {
    id: "a5", freightCode: "BR789123456", freightId: "6", type: "tentativa_entrega", priority: "media",
    timestamp: hoursAgo(5), description: "Tentativa de entrega sem sucesso para frete BR789123456. Destinatário ausente.",
    suggestedAction: "Agendar nova tentativa de entrega. Contatar destinatário para confirmar disponibilidade.", resolved: false,
  },
  {
    id: "a6", freightCode: "BR654321789", freightId: "5", type: "avaria", priority: "baixa",
    timestamp: hoursAgo(8), description: "Pequena avaria na embalagem externa detectada no frete BR654321789 durante triagem em Florianópolis.",
    suggestedAction: "Registrar ocorrência. Conteúdo interno aparenta estar intacto - monitorar.", resolved: false,
  },
];

export const deliveryChartData = [
  { day: "Seg", entregas: 24, previsao: 28 },
  { day: "Ter", entregas: 31, previsao: 30 },
  { day: "Qua", entregas: 28, previsao: 27 },
  { day: "Qui", entregas: 35, previsao: 32 },
  { day: "Sex", entregas: 22, previsao: 29 },
  { day: "Sáb", entregas: 18, previsao: 20 },
  { day: "Dom", entregas: 12, previsao: 15 },
];

export function generateRandomAlert(): Alert {
  const types: IncidentType[] = ["atraso", "parada_prolongada", "desvio_rota", "avaria", "sem_atualizacao"];
  const priorities: AlertPriority[] = ["critica", "alta", "media", "baixa"];
  const freight = mockFreights[Math.floor(Math.random() * mockFreights.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  return {
    id: `a${Date.now()}`,
    freightCode: freight.code,
    freightId: freight.id,
    type,
    priority,
    timestamp: new Date().toISOString(),
    description: `Alerta simulado: ${incidentLabels[type]} detectado no frete ${freight.code}.`,
    suggestedAction: "Verificar situação e tomar as medidas necessárias.",
    resolved: false,
  };
}
