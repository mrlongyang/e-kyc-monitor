import { FastifyInstance } from "fastify";
import {
  getCpuUsage,
  getMemoryUsage,
  getDiskUsage,
  getSystemHealth,
} from "./system.service";

export async function systemRoutes(app: FastifyInstance) {
  app.get("/api/system/cpu", async () => {
    return getCpuUsage();
  });

  app.get("/api/system/memory", async () => {
    return getMemoryUsage();
  });

  app.get("/api/system/disk", async () => {
    return getDiskUsage();
  });

  app.get("/api/system/health", async () => {
    return getSystemHealth();
  });
}