import api from "./axios";

export interface ServiceStatus {
  name: string;
  status: string;
  raw: string;
}

export async function getDashboardServices(): Promise<ServiceStatus[]> {
  const response = await api.get<ServiceStatus[]>("/api/services/live");

  return response.data;
}