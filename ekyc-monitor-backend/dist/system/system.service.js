import { runRemoteSudoCommand } from "../utils/remoteShell.js";
export async function getCpuUsage() {
    const command = `
    top -bn1 | grep "Cpu(s)"
  `;
    const output = await runRemoteSudoCommand(command);
    return {
        raw: output.trim(),
    };
}
export async function getMemoryUsage() {
    const command = `
    free -h
  `;
    const output = await runRemoteSudoCommand(command);
    return {
        raw: output.trim(),
    };
}
export async function getDiskUsage() {
    const command = `
    df -h
  `;
    const output = await runRemoteSudoCommand(command);
    return {
        raw: output.trim(),
    };
}
export async function getSystemHealth() {
    const [cpu, memory, disk] = await Promise.all([
        getCpuUsage(),
        getMemoryUsage(),
        getDiskUsage(),
    ]);
    return {
        cpu,
        memory,
        disk,
    };
}
