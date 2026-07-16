import { getDockerStats } from "./docker.service.js";
export async function dockerRoutes(app) {
    app.get("/api/docker/stats", async () => {
        return getDockerStats();
    });
}
