import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { getServiceErrorLogs } from "./logs.service.js";

interface LogParams {
  serviceName: string;
}

interface LogQuery {
  tail?: string;
}

export async function getServiceErrorLogsHandler(
  request: FastifyRequest<{
    Params: LogParams;
    Querystring: LogQuery;
  }>,
  reply: FastifyReply,
) {
  const { serviceName } = request.params;
  const tail = Number(request.query.tail ?? 300);

  try {
    const logs = await getServiceErrorLogs(
      serviceName,
      Number.isFinite(tail) ? tail : 300,
    );

    return reply.send({
      success: true,
      service: serviceName,
      count: logs.length,
      logs,
    });
  } catch (error) {
    request.log.error(error);

    return reply.status(500).send({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve service logs",
    });
  }
}