import { env } from "../../config/env";
import { runRemoteCommand } from "../../utils/remoteShell";

export async function getLiveDockerServices() {
  const command = `
    echo "${env.SSH_PASSWORD}" | sudo -S bash -c '
    cd ${env.SSH_WORKDIR} &&
    docker-compose ps
  '`;

  const output = await runRemoteCommand(command);
  console.log("SSH OUTPUT:");
  console.log(output);

  const serviceNames = [
    "bio-assay",
    "bio-auth",
    "bio-facerecognition",
    "bio-fingerprint",
    "bio-gateway",
    "bio-oam",
    "bio-ocr",
    "bio-oss",
  ];

  return serviceNames.map((name) => {
    const line = output
      .split("\n")
      .find((row) => row.startsWith(name));

    let status = "unknown";

    if (line?.includes("running")) status = "running";
    if (line?.includes("exited")) status = "exited";

    return {
      name,
      status,
      raw: line || null,
    };
  });
}