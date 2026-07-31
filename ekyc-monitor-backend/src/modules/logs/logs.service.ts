import { env } from "../../config/env.js";
import { runRemoteCommand } from "../../utils/remoteShell.js";

const ALLOWED_SERVICES = [
  "bio-assay",
  "bio-auth",
  "bio-facerecognition",
  "bio-oam",
  "bio-ocr",
  "bio-oss",
] as const;

type AllowedService = (typeof ALLOWED_SERVICES)[number];

export interface ServiceErrorLog {
  service: string;
  timestamp: string | null;
  level: "error" | "warning";
  message: string;
  raw: string;
}

function isAllowedService(service: string): service is AllowedService {
  return ALLOWED_SERVICES.includes(service as AllowedService);
}

function detectLevel(line: string): "error" | "warning" | null {
  const normalized = line.toLowerCase();

  if (
    normalized.includes("error") ||
    normalized.includes("exception") ||
    normalized.includes("failed") ||
    normalized.includes("failure") ||
    normalized.includes("connection refused") ||
    normalized.includes("timeout")
  ) {
    return "error";
  }

  if (
    normalized.includes("warn") ||
    normalized.includes("warning")
  ) {
    return "warning";
  }

  return null;
}

function extractTimestamp(line: string): string | null {
  const match = line.match(
    /\b\d{2}:\d{2}:\d{2}(?:\.\d{3})?\b/,
  );

  return match?.[0] ?? null;
}

export async function getServiceErrorLogs(
  serviceName: string,
  tail = 300,
): Promise<ServiceErrorLog[]> {
  if (!isAllowedService(serviceName)) {
    throw new Error(`Service '${serviceName}' is not allowed`);
  }

  const safeTail = Math.min(Math.max(tail, 10), 2000);

  const command = `
    echo "${env.SSH_PASSWORD}" | sudo -S bash -c '
      cd ${env.SSH_WORKDIR} &&
      docker-compose logs --no-color --tail=${safeTail} ${serviceName}
    '
  `;

  const output = await runRemoteCommand(command);

return output
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0)
  .map((line): ServiceErrorLog | null => {
    const level = detectLevel(line);

    if (!level) {
      return null;
    }

    return {
      service: serviceName,
      timestamp: extractTimestamp(line),
      level,
      message: line.replace(
        new RegExp(`^${serviceName}\\s*\\|\\s*`),
        "",
      ),
      raw: line,
    };
  })
  .filter(
    (log): log is ServiceErrorLog => log !== null,
  )
  .reverse();
}