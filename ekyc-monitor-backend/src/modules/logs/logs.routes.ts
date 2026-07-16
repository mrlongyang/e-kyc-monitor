import { FastifyInstance } from "fastify";
import { getDockerLogs } from "./logs.service.js";

export async function logsRoutes(app: FastifyInstance) {
  app.get("/api/logs/service/:serviceName", async (request) => {
    const { serviceName } = request.params as { serviceName: string };

    const logs = await getDockerLogs(serviceName);

    return {
      serviceName,
      logs,
    };
  });
}