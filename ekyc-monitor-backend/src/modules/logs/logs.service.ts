import { env } from "../../config/env";
import { runRemoteCommand } from "../../utils/remoteShell";

export async function getDockerLogs(serviceName: string) {
  const command = `
    echo "${env.SSH_PASSWORD}" | sudo -S bash -c '
      cd ${env.SSH_WORKDIR} &&
      docker logs --tail 100 ${serviceName}
    '
  `;

  const output = await runRemoteCommand(command);

  return output;
}