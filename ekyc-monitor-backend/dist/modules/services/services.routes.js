import { getLiveDockerServices } from "./services.live.js";
import { controlServiceHandler } from "./services.controller.js";
export async function servicesRoutes(app) {
    app.get("/api/services/live", async () => {
        return getLiveDockerServices();
    });
    app.post("/:serviceName/control", controlServiceHandler);
}
