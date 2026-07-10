import axios from "./axios";

export async function getDockerStats() {
  const res = await axios.get("/api/docker/stats");
  return res.data;
}