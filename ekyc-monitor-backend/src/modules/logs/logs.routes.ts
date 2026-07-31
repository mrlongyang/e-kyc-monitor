import type { FastifyInstance } from "fastify";
import { getServiceErrorLogsHandler } from "./logs.controller.js";

export async function logsRoutes(
  app: FastifyInstance,
) {
  app.get<{
    Params: {
      serviceName: string;
    };
    Querystring: {
      tail?: string;
    };
  }>(
    "/:serviceName/errors",
    getServiceErrorLogsHandler,
  );
}