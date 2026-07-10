import axios from "./axios";


export async function getSystemHealth() {
  const res = await axios.get("/api/system/health");
  return res.data;
}