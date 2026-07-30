import { env } from "../../config/env.js";
import { runRemoteCommand } from "../../utils/remoteShell.js";

const ALLOWED_SERVICES = [
  "bio-assay",
  "bio-auth",
  "bio-facerecognition",
  "bio-fingerprint",
  "bio-gateway",
  "bio-oam",
  "bio-ocr",
  "bio-oss",
] as const;

const ALLOWED_ACTIONS = ["start", "stop", "restart"] as const;

type ServiceAction = (typeof ALLOWED_ACTIONS)[number];
type AllowedService = (typeof ALLOWED_SERVICES)[number];

function isAllowedService(serviceName: string): serviceName is AllowedService {
  return ALLOWED_SERVICES.includes(serviceName as AllowedService);
}

function isAllowedAction(action: string): action is ServiceAction {
  return ALLOWED_ACTIONS.includes(action as ServiceAction);
}

export async function controlDockerService(
  serviceName: string,
  action: ServiceAction,
): Promise<string> {
  if (!isAllowedService(serviceName)) {
    throw new Error(`Service '${serviceName}' is not allowed`);
  }

  if (!isAllowedAction(action)) {
    throw new Error(`Action '${action}' is not allowed`);
  }

  const command = `
    echo "${env.SSH_PASSWORD}" | sudo -S bash -c '
      cd ${env.SSH_WORKDIR} &&
      docker-compose ${action} ${serviceName}
    '
  `;

  return runRemoteCommand(command);
}