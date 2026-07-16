import { env } from "./config/env.js";
import { buildApp } from "./app.js";
import { startMonitorJob } from "./jobs/monitor.job.js";
async function start() {
    const app = await buildApp();
    startMonitorJob();
    await app.listen({
        port: Number(env.PORT),
        host: "0.0.0.0",
    });
}
start();
