// src/modules/dashboard/dashboard.service.ts
import { db } from "../../db/index.js";
import { services, alerts } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function getDashboardSummary() {
  const allServices = await db.select().from(services);
  const activeAlerts = await db
    .select()
    .from(alerts)
    .where(eq(alerts.isResolved, false));

  return {
    totalServices: allServices.length,
    runningServices: allServices.filter((s) => s.status === "running").length,
    failedServices: allServices.filter((s) => s.status !== "running").length,
    activeAlerts: activeAlerts.length,
  };
}