import { getLiveDockerServices } from "./services.live.js";
export async function servicesRoutes(app) {
    app.get("/api/services/live", async () => {
        return getLiveDockerServices();
    });
}
