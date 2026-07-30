import type { FastifyInstance } from "fastify";
import { getLiveDockerServices } from "./services.live.js";
import { controlServiceHandler } from "./services.controller.js";

export async function servicesRoutes(app: FastifyInstance) {
  app.get("/live", async (_request, reply) => {
    try {
      const services = await getLiveDockerServices();
      return reply.send(services);
    } catch (error) {
      app.log.error(error);

      return reply.status(500).send({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve live services",
      });
    }
  });

  app.post<{
    Params: {
      serviceName: string;
    };
    Body: {
      action: "start" | "stop" | "restart";
    };
  }>("/:serviceName/control", controlServiceHandler);
}