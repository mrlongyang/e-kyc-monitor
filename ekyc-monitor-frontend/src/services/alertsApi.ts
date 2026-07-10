import axios from "./axios";

export async function getActiveAlerts() {
  const res = await axios.get("/api/alerts/active");
  console.log("API /api/alerts/active:", res.data);
  return res.data;
}