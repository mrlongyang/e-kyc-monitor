import axios from "./axios";


export async function getLiveServices() {
  const res = await axios.get("/api/services/live");
  return res.data;
}