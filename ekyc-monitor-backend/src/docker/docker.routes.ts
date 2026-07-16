import { FastifyInstance } from "fastify";
import { getDockerStats } from "./docker.service.js";

export async function dockerRoutes(app: FastifyInstance) {
  app.get("/api/docker/stats", async () => {
    return getDockerStats();
  });
}