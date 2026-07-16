// src/utils/shell.ts
import { exec } from "child_process";
export function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr || error.message);
                return;
            }
            resolve(stdout);
        });
    });
}
