import { FastifyInstance } from "fastify";
import { getLiveDockerServices } from "./services.live";

export async function servicesRoutes(app: FastifyInstance) {
  app.get("/api/services/live", async () => {
    return getLiveDockerServices();
  });
}