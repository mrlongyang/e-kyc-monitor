import { runRemoteSudoCommand } from "../utils/remoteShell.js";

export async function getDockerStats() {
  const command = `
    docker stats --no-stream --format "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}|{{.BlockIO}}"
  `;

  const output = await runRemoteSudoCommand(command);

  return output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line: string) => {
      const [name, cpu, memory, memoryPercent, networkIO, blockIO] =
        line.split("|");

      return {
        name,
        cpu,
        memory,
        memoryPercent,
        networkIO,
        blockIO,
      };
    });
}