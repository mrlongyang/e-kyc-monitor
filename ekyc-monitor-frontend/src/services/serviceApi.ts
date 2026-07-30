import api from "./axios";

export type ServiceAction = "start" | "stop" | "restart";

export interface ControlServiceResponse {
  success: boolean;
  message: string;
  output?: string;
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