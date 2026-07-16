import { FastifyInstance } from "fastify";
import { getAlerts, getActiveAlerts } from "./alerts.service.js";

export async function alertsRoutes(app: FastifyInstance) {
  app.get("/api/alerts", async () => {
    return getAlerts();
  });

  app.get("/api/alerts/active", async () => {
    return getActiveAlerts();
  });
}