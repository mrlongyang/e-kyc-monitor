import { Client } from "ssh2";
import { env } from "../config/env.js";

export function executeRemoteCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const connection = new Client();

    connection
      .on("ready", () => {
        console.log(`[SSH] Connected to ${env.SSH_HOST}`);
        console.log("[SSH] Executing approved service-control command");

        connection.exec(command, (error, stream) => {
          if (error) {
            connection.end();
            reject(error);
            return;
          }

          let stdout = "";
          let stderr = "";

          stream.on("data", (data: Buffer) => {
            stdout += data.toString();
          });

          stream.stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
          });

          stream.on("close", (code: number | null) => {
            connection.end();

            console.log(`[SSH] Exit code: ${code}`);

            if (code !== 0) {
              reject(
                new Error(
                  stderr.trim() ||
                    `Remote command failed with exit code ${code}`,
                ),
              );
              return;
            }

            resolve(stdout.trim());
          });
        });
      })
      .on("error", (error) => {
        console.error("[SSH] Connection error:", error);
        reject(error);
      })
      .connect({
        host: env.SSH_HOST,
        port: Number(env.SSH_PORT),
        username: env.SSH_USERNAME,
        password: env.SSH_PASSWORD,
      });
  });
}

export function runRemoteCommand(command: string): Promise<string> {
  return executeRemoteCommand(command);
}


export function runRemoteSudoCommand(command: string): Promise<string> {
  return executeRemoteCommand(`sudo -n ${command}`);
}