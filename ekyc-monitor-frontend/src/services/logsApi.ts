import api from "./axios";

export interface ServiceErrorLog {
  service: string;
  timestamp: string | null;
  level: "error" | "warning";
  message: string;
  raw: string;
}

interface ErrorLogsResponse {
  success: boolean;
  service: string;
  count: number;
  logs: ServiceErrorLog[];
}

export async function getServiceErrorLogs(
  serviceName: string,
  tail = 300,
): Promise<ServiceErrorLog[]> {
  const response = 
    await api.get<ErrorLogsResponse>(
      `/api/logs/${encodeURIComponent(serviceName)}/errors`,
      {
        params: {
          tail,
        },
      },
    );
  return response.data.logs;
}