import { getDashboardSummary } from "./dashboard.service.js";
export async function dashboardRoutes(app) {
    app.get("/api/dashboard/summary", async () => {
        return getDashboardSummary();
    });
}
