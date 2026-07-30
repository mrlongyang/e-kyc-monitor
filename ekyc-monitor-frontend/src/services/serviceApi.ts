import api from "./axios";

export interface ServiceStatus {
  name: string;
  status: string;
  raw: string | null;
}

export type ServiceAction =
  | "start"
  | "stop"
  | "restart";

export interface ControlServiceResponse {
  success: boolean;
  message: string;
  output?: string;
}

export async function getLiveServices(): Promise<ServiceStatus[]> {
  const response =
    await api.get<ServiceStatus[]>(
      "/api/services/live",
    );

  return response.data;
}

export async function controlService(
  serviceName: string,
  action: ServiceAction,
): Promise<ControlServiceResponse> {
  const response =
    await api.post<ControlServiceResponse>(
      `/api/services/${encodeURIComponent(serviceName)}/control`,
      {
        action,
      },
    );

  return response.data;
}