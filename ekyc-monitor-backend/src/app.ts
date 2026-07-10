import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

import { servicesRoutes } from "./modules/services/services.routes";
import { logsRoutes } from "./modules/logs/logs.routes";
import { runRemoteCommand } from "./utils/remoteShell";
import { systemRoutes } from "./system/system.routes";
import { dockerRoutes } from "./docker/docker.routes";
import { alertsRoutes } from "./alerts/alerts.routes";
import { websocketRoutes } from "./ws/ws.routes";


export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: "*",
  });

  await app.register(websocket);
  await app.register(websocketRoutes);

  await app.register(servicesRoutes);
  await app.register(logsRoutes);
  await app.register(systemRoutes);
  await app.register(dockerRoutes);
  await app.register(alertsRoutes);


  app.get("/", async () => {
    return { message: "eKYC Monitor Backend Running" };
  });

  app.get("/api/test-ssh", async () => {
  const result = await runRemoteCommand("whoami && hostname && pwd");
  return { result };
  });

  return app;
}