import { buildApp } from "./app";
import { env } from "./config/env";
import { startMonitorJob } from "./jobs/monitor.job";

async function start() {
  const app = await buildApp();

  startMonitorJob();

  await app.listen({
    port: Number(env.PORT),
    host: "0.0.0.0",
  });
}

start();