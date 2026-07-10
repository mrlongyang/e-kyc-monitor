// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ServicesView from "@/views/ServicesView.vue";
import LogsView from "@/views/LogsView.vue";
import SystemView from "@/views/SystemView.vue";
import AlertsView from "@/views/AlertsView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "dashboard", component: DashboardView },
    { path: "/services", name: "services", component: ServicesView },
    { path: "/logs", name: "logs", component: LogsView },
    { path: "/system", name: "system", component: SystemView },
    { path: "/alerts", name: "alerts", component: AlertsView },
  ],
});

export default router;