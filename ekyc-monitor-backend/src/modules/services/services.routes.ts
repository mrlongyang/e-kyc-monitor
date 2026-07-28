import { FastifyInstance } from "fastify";
import { getLiveDockerServices } from "./services.live.js";
import { controlServiceHandler } from "./services.controller.js";

export async function servicesRoutes(app: FastifyInstance) {
  app.get("/api/services/live", async () => {
    return getLiveDockerServices();
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