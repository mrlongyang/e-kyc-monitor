import { Client } from "ssh2";
import { env } from "../config/env";

export function runRemoteCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on("keyboard-interactive", (_name, _instructions, _lang, prompts, finish) => {
        finish(prompts.map(() => env.SSH_PASSWORD));
      })
      .on("ready", () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            reject(err);
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

          stream.on("close", () => {
            conn.end();
            resolve(stdout || stderr);
          });
        });
      })
      .on("error", (err) => {
        reject(new Error(`SSH connection error: ${err.message}`));
      })
      .connect({
        host: env.SSH_HOST,
        port: env.SSH_PORT,
        username: env.SSH_USERNAME,
        password: env.SSH_PASSWORD,
        tryKeyboard: true,
        readyTimeout: 10000,
      });
  });
}


export async function runRemoteSudoCommand(command: string): Promise<string> {
  const sudoCommand = `
    echo "${env.SSH_PASSWORD}" | sudo -S bash -c '
      ${command}
    '
  `;

  return runRemoteCommand(sudoCommand);
}