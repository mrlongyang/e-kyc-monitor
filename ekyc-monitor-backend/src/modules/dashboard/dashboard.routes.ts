// src/modules/dashboard/dashboard.routes.ts
import { FastifyInstance } from "fastify";
import { getDashboardSummary } from "./dashboard.service.js";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/api/dashboard/summary", async () => {
    return getDashboardSummary();
  });
}