import axios from "./axios";

export async function getServiceLogs(serviceName: string) {
  const res = await axios.get(`/api/logs/service/${serviceName}`);
  return res.data;
}