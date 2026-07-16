import { getDockerLogs } from "./logs.service.js";
export async function logsRoutes(app) {
    app.get("/api/logs/service/:serviceName", async (request) => {
        const { serviceName } = request.params;
        const logs = await getDockerLogs(serviceName);
        return {
            serviceName,
            logs,
        };
    });
}
