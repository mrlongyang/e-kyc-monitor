import type { FastifyReply, FastifyRequest } from "fastify";
import { controlDockerService } from "./services.service.js";

interface ControlParams {
  serviceName: string;
}

interface ControlBody {
  action: "start" | "stop" | "restart";
}

export async function controlServiceHandler(
  request: FastifyRequest<{
    Params: ControlParams;
    Body: ControlBody;
  }>,
  reply: FastifyReply,
) {
  const { serviceName } = request.params;
  const { action } = request.body;

  try {
    const result = await controlDockerService(serviceName, action);

    return reply.send({
      success: true,
      message: `${serviceName} ${action} command completed`,
      output: result,
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to control service",
    });
  }
}