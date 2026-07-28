import { Client } from "ssh2";
import { env } from "../config/env.js";

export function executeRemoteCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const connection = new Client();

    connection
      .on("ready", () => {
        connection.exec(command, (error, stream) => {
          if (error) {
            connection.end();
            reject(error);
            return;
          }

          let stdout = "";
          let stderr = "";

          stream
            .on("close", (code: number) => {
              connection.end();

              if (code !== 0) {
                reject(
                  new Error(
                    stderr || `Remote command failed with code ${code}`,
                  ),
                );
                return;
              }

              resolve(stdout.trim());
            })
            .on("data", (data: Buffer) => {
              stdout += data.toString();
            });

          stream.stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
          });
        });
      })
      .on("error", reject)
      .connect({
        host: env.SSH_HOST,
        port: env.SSH_PORT,
        username: env.SSH_USERNAME,
        password: env.SSH_PASSWORD,
      });
  });
}