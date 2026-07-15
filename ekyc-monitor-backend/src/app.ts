import cors from "@fastify/cors";
import Fastify from "fastify";
import websocket from "@fastify/websocket";

import { servicesRoutes } from "./modules/services/services.routes.js";
import { logsRoutes } from "./modules/logs/logs.routes.js";
import { runRemoteCommand } from "./utils/remoteShell.js";
import { systemRoutes } from "./system/system.routes.js";
import { dockerRoutes } from "./docker/docker.routes.js";
import { alertsRoutes } from "./alerts/alerts.routes.js";
import { websocketRoutes } from "./ws/ws.routes.js";


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