import cron from "node-cron";
import { getLiveDockerServices } from "../modules/services/services.live.js";
import { getDockerStats } from "../docker/docker.service.js";
import { createAlert, hasActiveAlert, resolveAlert, } from "../alerts/alerts.service.js";
let latestServices = [];
let latestDockerStats = [];
export function getCachedServices() {
    return latestServices;
}
export function getCachedDockerStats() {
    return latestDockerStats;
}
export function startMonitorJob() {
    cron.schedule("*/30 * * * * *", async () => {
        try {
            latestServices = await getLiveDockerServices();
            latestDockerStats = await getDockerStats();
            for (const service of latestServices) {
                const isDown = service.status !== "running";
                const alreadyActive = hasActiveAlert(service.name);
                if (isDown && !alreadyActive) {
                    createAlert({
                        serviceName: service.name,
                        message: `${service.name} is ${service.status}`,
                        severity: "critical",
                        status: "active",
                    });
                }
                if (!isDown && alreadyActive) {
                    resolveAlert(service.name);
                    createAlert({
                        serviceName: service.name,
                        message: `${service.name} has recovered`,
                        severity: "info",
                        status: "resolved",
                    });
                }
            }
            console.log("Monitor job completed");
        }
        catch (error) {
            console.error("Monitor failed:", error);
        }
    });
}
