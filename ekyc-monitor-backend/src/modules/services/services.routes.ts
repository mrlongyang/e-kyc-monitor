import { FastifyInstance } from "fastify";
import { getLiveDockerServices } from "./services.live.js";

export async function servicesRoutes(app: FastifyInstance) {
  app.get("/api/services/live", async () => {
    return getLiveDockerServices();
  });
}