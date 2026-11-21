import { FreightItem } from "@/data/freightData";

// Interface que define o que o n8n vai nos devolver
export interface AgentActionLog {
  id: string;
  timestamp: string;
  freightCode: string;
  riskLevel: "baixo" | "medio" | "alto" | "critico";
  reasoning: string;
  actionTaken: string;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  logs: AgentActionLog[];
}

// Forçando a URL correta de produção
const N8N_WEBHOOK_URL = "https://welitondev.app.n8n.cloud/webhook/analisar-fretes";

export const analyzeFreightsWithAgent = async (freights: FreightItem[]): Promise<AgentResponse> => {
  const freightsToAnalyze = freights.filter(
  
    (f) => f.status === "critico" || f.status === "atrasado" || f.incidents.length > 0
  );

  if (freightsToAnalyze.length === 0) {
    return {
      success: true,
      message: "Nenhum frete com risco detectado no momento.",
      logs: [],
    };
  }

  try {
    console.log("Enviando dados para o n8n:", N8N_WEBHOOK_URL);
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        freights: freightsToAnalyze,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Resposta do n8n:", data);
    return data as AgentResponse;
  } catch (error) {
    console.error("Erro ao chamar o Agente IA:", error);
    throw error;
  }
};