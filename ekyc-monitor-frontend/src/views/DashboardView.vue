<template>
  <div class="dashboard-page">
    <!-- Top header -->
    <section class="dashboard-hero">
      <div>
        <div class="page-breadcrumb">Monitoring / Dashboard</div>
        <h1>e-KYC Monitoring Dashboard</h1>
        <p>
          Monitor service availability, health, alerts, and container controls
          from one place.
        </p>
      </div>

      <div class="hero-actions">
        <div class="live-badge">
          <span class="live-dot"></span>
          Live monitoring
        </div>

        <el-button
          type="primary"
          class="refresh-button"
          :loading="loading"
          @click="loadDashboard"
        >
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </section>

    <!-- Summary cards -->
    <el-row :gutter="18" class="summary-grid">
      <el-col
        v-for="card in summaryCards"
        :key="card.title"
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <div class="summary-card" :class="card.className">
          <div class="summary-card__top">
            <div class="summary-icon">
              <el-icon>
                <component :is="card.icon" />
              </el-icon>
            </div>

            <span class="summary-trend">
              {{ card.caption }}
            </span>
          </div>

          <div class="summary-value">{{ card.value }}</div>
          <div class="summary-title">{{ card.title }}</div>

          <div class="summary-footer">
            <span>{{ card.description }}</span>
            <span class="summary-indicator"></span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Alert messages -->
    <div class="message-stack">
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        closable
        @close="errorMessage = ''"
      />

      <el-alert
        v-if="downCount > 0"
        title="Critical service issue"
        :description="`${downCount} monitored service(s) are currently unavailable.`"
        type="error"
        show-icon
      />

      <el-alert
        v-if="controlMessage"
        title="Service command completed"
        :description="controlMessage"
        type="success"
        show-icon
        closable
        @close="controlMessage = ''"
      />

      <el-alert
        v-if="controlError"
        title="Service command failed"
        :description="controlError"
        type="error"
        show-icon
        closable
        @close="controlError = ''"
      />
    </div>

    <!-- Main service panel -->
    <section class="service-panel">
      <div class="panel-header">
        <div>
          <div class="panel-title-row">
            <h2>Service Status</h2>

            <span class="auto-refresh-badge">
              <el-icon><Timer /></el-icon>
              Auto refresh: 30s
            </span>
          </div>

          <p>Current health and runtime state of all e-KYC services.</p>
        </div>

        <div class="panel-meta">
          <span>Last updated</span>
          <strong>{{ lastUpdated || "Waiting for data..." }}</strong>
        </div>
      </div>

      <div class="table-toolbar">
        <el-input
          v-model="searchKeyword"
          clearable
          placeholder="Search service..."
          class="service-search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="statusFilter"
          class="status-filter"
          placeholder="All statuses"
        >
          <el-option label="All statuses" value="all" />
          <el-option label="Running" value="running" />
          <el-option label="Stopped / exited" value="down" />
          <el-option label="Unknown" value="unknown" />
        </el-select>
      </div>

      <el-table
        v-loading="loading"
        :data="filteredServices"
        row-key="name"
        class="service-table"
        empty-text="No services found"
      >
        <el-table-column label="Service" min-width="230">
          <template #default="{ row }">
            <div class="service-cell">
              <div class="service-avatar">
                {{ serviceInitials(row.name) }}
              </div>

              <div class="service-info">
                <div class="service-name-row">
                  <strong>{{ row.name }}</strong>

                  <el-tag
                    v-if="!canControlService(row.name)"
                    size="small"
                    effect="plain"
                    type="info"
                  >
                    Not licensed
                  </el-tag>
                </div>

                <span>
                  {{
                    canControlService(row.name)
                      ? "Managed container service"
                      : "Visible only"
                  }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="150">
          <template #default="{ row }">
            <div
              class="status-pill"
              :class="`status-pill--${statusClass(row.status)}`"
            >
              <span class="status-dot"></span>
              {{ normalizeStatus(row.status) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Health" min-width="250">
          <template #default="{ row }">
            <div class="health-cell">
              <div class="health-header">
                <span>
                  {{ isRunning(row.status) ? "Healthy" : "Unavailable" }}
                </span>
                <strong>{{ isRunning(row.status) ? "100%" : "0%" }}</strong>
              </div>

              <el-progress
                :percentage="isRunning(row.status) ? 100 : 0"
                :show-text="false"
                :status="isRunning(row.status) ? 'success' : 'exception'"
                :stroke-width="8"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Runtime details" min-width="330">
          <template #default="{ row }">
            <div class="runtime-cell">
              <el-icon><Monitor /></el-icon>
              <span>{{ row.raw || "No runtime information" }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="Actions"
          width="285"
          fixed="right"
          align="right"
        >
          <template #default="{ row }">
            <div class="action-buttons">
              <template v-if="canControlService(row.name)">
                <el-button
                  v-if="!isRunning(row.status)"
                  type="success"
                  size="small"
                  :loading="isControlling(row.name, 'start')"
                  :disabled="isAnotherCommandRunning(row.name)"
                  @click="handleServiceControl(row.name, 'start')"
                >
                  <el-icon><VideoPlay /></el-icon>
                  Start
                </el-button>

                <el-button
                  v-if="isRunning(row.status)"
                  type="danger"
                  plain
                  size="small"
                  :loading="isControlling(row.name, 'stop')"
                  :disabled="isAnotherCommandRunning(row.name)"
                  @click="handleServiceControl(row.name, 'stop')"
                >
                  <el-icon><VideoPause /></el-icon>
                  Stop
                </el-button>

                <el-button
                  v-if="isRunning(row.status)"
                  type="warning"
                  plain
                  size="small"
                  :loading="isControlling(row.name, 'restart')"
                  :disabled="isAnotherCommandRunning(row.name)"
                  @click="handleServiceControl(row.name, 'restart')"
                >
                  <el-icon><RefreshRight /></el-icon>
                  Restart
                </el-button>
              </template>

              <el-button
                size="small"
                class="logs-button"
                @click="openErrorLogs(row.name)"
              >
                <el-icon><Document /></el-icon>
                Logs
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- Logs dialog -->
    <el-dialog
      v-model="logDialogVisible"
      :title="`Error logs · ${selectedLogService}`"
      width="82%"
      top="6vh"
      destroy-on-close
      class="logs-dialog"
    >
      <div v-loading="logLoading" class="log-dialog-content">
        <el-empty
          v-if="!logLoading && serviceErrorLogs.length === 0"
          description="No recent errors found"
        />

        <el-table
          v-else
          :data="serviceErrorLogs"
          stripe
          max-height="540"
        >
          <el-table-column prop="timestamp" label="Time" width="165" />

          <el-table-column label="Level" width="110">
            <template #default="{ row }">
              <el-tag
                :type="row.level === 'error' ? 'danger' : 'warning'"
                effect="dark"
              >
                {{ row.level }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="message" label="Message" min-width="520">
            <template #default="{ row }">
              <pre class="log-message">{{ row.message }}</pre>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="logDialogVisible = false">
          Close
        </el-button>

        <el-button
          type="primary"
          :loading="logLoading"
          @click="openErrorLogs(selectedLogService)"
        >
          <el-icon><Refresh /></el-icon>
          Refresh logs
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import {
  ElMessage,
  ElMessageBox,
} from "element-plus";
import {
  Bell,
  CircleCheck,
  Connection,
  Document,
  Monitor,
  Refresh,
  RefreshRight,
  Search,
  Timer,
  VideoPause,
  VideoPlay,
  WarningFilled,
} from "@element-plus/icons-vue";
import axios from "axios";

import {
  getDashboardServices,
  type ServiceStatus,
} from "../services/dashboardApi";

import {
  controlService,
  type ServiceAction,
} from "../services/serviceApi";

import {
  getServiceErrorLogs,
  type ServiceErrorLog,
} from "../services/logsApi";

const services = ref<ServiceStatus[]>([]);
const loading = ref(false);
const errorMessage = ref("");
const controlMessage = ref("");
const controlError = ref("");
const lastUpdated = ref("");

const searchKeyword = ref("");
const statusFilter = ref("all");

const controllingService = ref<string | null>(null);
const controlAction = ref<ServiceAction | null>(null);

const logDialogVisible = ref(false);
const logLoading = ref(false);
const selectedLogService = ref("");
const serviceErrorLogs = ref<ServiceErrorLog[]>([]);

let refreshTimer: ReturnType<typeof setInterval> | null = null;

const disabledServices = [
  "bio-fingerprint",
  "bio-gateway",
];

const monitoredServices = computed(() =>
  services.value.filter(
    (service) => !disabledServices.includes(service.name),
  ),
);

const runningCount = computed(() =>
  monitoredServices.value.filter((service) =>
    isRunning(service.status),
  ).length,
);

const downCount = computed(() =>
  monitoredServices.value.filter(
    (service) => !isRunning(service.status),
  ).length,
);

const activeAlerts = computed(() => downCount.value);

const summaryCards = computed(() => [
  {
    title: "Total Services",
    value: monitoredServices.value.length,
    caption: "Monitored",
    description: "Licensed services",
    icon: Connection,
    className: "summary-card--primary",
  },
  {
    title: "Running",
    value: runningCount.value,
    caption: "Healthy",
    description: "Currently online",
    icon: CircleCheck,
    className: "summary-card--success",
  },
  {
    title: "Down",
    value: downCount.value,
    caption: downCount.value > 0 ? "Attention" : "Stable",
    description: "Unavailable services",
    icon: WarningFilled,
    className: "summary-card--danger",
  },
  {
    title: "Active Alerts",
    value: activeAlerts.value,
    caption: activeAlerts.value > 0 ? "Action needed" : "Clear",
    description: "Open incidents",
    icon: Bell,
    className: "summary-card--warning",
  },
]);

const filteredServices = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  return services.value.filter((service) => {
    const matchesSearch =
      !keyword ||
      service.name.toLowerCase().includes(keyword) ||
      (service.raw || "").toLowerCase().includes(keyword);

    const normalized = normalizeStatus(service.status);

    const matchesStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "running" && normalized === "running") ||
      (statusFilter.value === "unknown" && normalized === "unknown") ||
      (statusFilter.value === "down" &&
        normalized !== "running" &&
        normalized !== "unknown");

    return matchesSearch && matchesStatus;
  });
});

function normalizeStatus(status?: string): string {
  return status?.toLowerCase() || "unknown";
}

function isRunning(status?: string): boolean {
  return normalizeStatus(status) === "running";
}

function statusClass(status?: string): string {
  const normalized = normalizeStatus(status);

  if (normalized === "running") return "running";
  if (normalized === "unknown") return "unknown";
  return "down";
}

function serviceInitials(name: string): string {
  return name
    .replace("bio-", "")
    .split("-")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function canControlService(serviceName: string): boolean {
  return !disabledServices.includes(serviceName);
}

function isControlling(
  serviceName: string,
  action: ServiceAction,
): boolean {
  return (
    controllingService.value === serviceName &&
    controlAction.value === action
  );
}

function isAnotherCommandRunning(serviceName: string): boolean {
  return (
    controllingService.value !== null &&
    controllingService.value !== serviceName
  );
}

async function openErrorLogs(serviceName: string): Promise<void> {
  selectedLogService.value = serviceName;
  logDialogVisible.value = true;
  logLoading.value = true;
  serviceErrorLogs.value = [];

  try {
    serviceErrorLogs.value =
      await getServiceErrorLogs(serviceName, 500);
  } catch (error) {
    console.error(`Failed to load logs for ${serviceName}:`, error);
    ElMessage.error(`Unable to load logs for ${serviceName}`);
  } finally {
    logLoading.value = false;
  }
}

async function loadDashboard(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";

  try {
    services.value = await getDashboardServices();

    lastUpdated.value = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error: unknown) {
    console.error("Failed to load dashboard:", error);
    errorMessage.value = "Unable to load service data.";

    if (services.value.length === 0) {
      services.value = [];
    }
  } finally {
    loading.value = false;
  }
}

async function handleServiceControl(
  serviceName: string,
  action: ServiceAction,
): Promise<void> {
  if (!canControlService(serviceName)) {
    ElMessage.warning(`${serviceName} is not available for control.`);
    return;
  }

  const actionText =
    action.charAt(0).toUpperCase() + action.slice(1);

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to ${action} ${serviceName}?`,
      `${actionText} service`,
      {
        confirmButtonText: actionText,
        cancelButtonText: "Cancel",
        type: action === "stop" ? "warning" : "info",
        closeOnClickModal: false,
      },
    );
  } catch {
    return;
  }

  controllingService.value = serviceName;
  controlAction.value = action;
  controlMessage.value = "";
  controlError.value = "";

  try {
    const response = await controlService(serviceName, action);

    controlMessage.value =
      response.message ||
      `${serviceName} ${action} command completed.`;

    ElMessage.success(controlMessage.value);

    await wait(1500);
    await loadDashboard();
  } catch (error: unknown) {
    console.error(`Failed to ${action} ${serviceName}:`, error);

    const message = extractErrorMessage(
      error,
      `Unable to ${action} ${serviceName}.`,
    );

    controlError.value = message;
    ElMessage.error(message);
  } finally {
    controllingService.value = null;
    controlAction.value = null;
  }
}

function extractErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = (
      error.response?.data as { message?: string } | undefined
    )?.message;

    return responseMessage || error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

onMounted(async () => {
  await loadDashboard();

  refreshTimer = setInterval(() => {
    if (!controllingService.value) {
      void loadDashboard();
    }
  }, 30_000);
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
});
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
  padding: 28px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top right, rgba(79, 70, 229, 0.08), transparent 28%),
    #f5f7fb;
}

.dashboard-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-breadcrumb {
  margin-bottom: 8px;
  color: #6366f1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-hero h1 {
  margin: 0;
  color: #172033;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.dashboard-hero p {
  max-width: 680px;
  margin: 8px 0 0;
  color: #697386;
  font-size: 14px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border: 1px solid #dfe7f2;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.14);
}

.refresh-button {
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.22);
}

.summary-grid {
  margin-bottom: 6px;
}

.summary-grid :deep(.el-col) {
  margin-bottom: 18px;
}

.summary-card {
  position: relative;
  overflow: hidden;
  min-height: 170px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.1);
}

.summary-card::after {
  position: absolute;
  top: -35px;
  right: -35px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  content: "";
  opacity: 0.12;
}

.summary-card--primary::after {
  background: #4f46e5;
}

.summary-card--success::after {
  background: #22c55e;
}

.summary-card--danger::after {
  background: #ef4444;
}

.summary-card--warning::after {
  background: #f59e0b;
}

.summary-card__top,
.summary-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  font-size: 20px;
}

.summary-card--primary .summary-icon {
  color: #4f46e5;
  background: #eef2ff;
}

.summary-card--success .summary-icon {
  color: #16a34a;
  background: #ecfdf3;
}

.summary-card--danger .summary-icon {
  color: #dc2626;
  background: #fef2f2;
}

.summary-card--warning .summary-icon {
  color: #d97706;
  background: #fffbeb;
}

.summary-trend {
  position: relative;
  z-index: 1;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.summary-value {
  margin-top: 18px;
  color: #172033;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.summary-title {
  margin-top: 7px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.summary-footer {
  margin-top: 16px;
  color: #94a3b8;
  font-size: 12px;
}

.summary-indicator {
  width: 30px;
  height: 4px;
  border-radius: 999px;
  background: #dbe4f0;
}

.summary-card--primary .summary-indicator {
  background: #6366f1;
}

.summary-card--success .summary-indicator {
  background: #22c55e;
}

.summary-card--danger .summary-indicator {
  background: #ef4444;
}

.summary-card--warning .summary-indicator {
  background: #f59e0b;
}

.message-stack {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.service-panel {
  overflow: hidden;
  border: 1px solid #e5eaf2;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.app-layout {
  min-height: 100vh;
  background: #f5f7fb;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;

  width: 220px;
  height: 100vh;
  overflow-y: auto;

  background: #111827;
  z-index: 1000;
}

.main-content {
  min-height: 100vh;
  margin-left: 220px;
  background: #f5f7fb;
}


.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid #edf1f6;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-header h2 {
  margin: 0;
  color: #172033;
  font-size: 18px;
  font-weight: 800;
}

.panel-header p {
  margin: 7px 0 0;
  color: #8a94a6;
  font-size: 13px;
}

.auto-refresh-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.panel-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  color: #94a3b8;
  font-size: 11px;
}

.panel-meta strong {
  color: #475569;
  font-size: 12px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #edf1f6;
  background: #fbfcfe;
}

.service-search {
  width: 280px;
}

.status-filter {
  width: 180px;
}

.table-toolbar :deep(.el-input__wrapper),
.table-toolbar :deep(.el-select__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #dfe6ef inset;
}

.service-table {
  --el-table-border-color: #edf1f6;
  --el-table-header-bg-color: #fbfcfe;
  --el-table-row-hover-bg-color: #f8faff;
}

.service-table :deep(th.el-table__cell) {
  height: 48px;
  color: #7c8799;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.service-table :deep(td.el-table__cell) {
  padding: 14px 0;
}

.service-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-avatar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: #4f46e5;
  font-size: 12px;
  font-weight: 800;
}

.service-info {
  min-width: 0;
}

.service-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-info strong {
  color: #263247;
  font-size: 13px;
}

.service-info > span {
  display: block;
  margin-top: 4px;
  color: #9aa4b4;
  font-size: 11px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-pill--running {
  color: #15803d;
  background: #ecfdf3;
}

.status-pill--running .status-dot {
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

.status-pill--down {
  color: #b91c1c;
  background: #fef2f2;
}

.status-pill--down .status-dot {
  background: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
}

.status-pill--unknown {
  color: #a16207;
  background: #fffbeb;
}

.status-pill--unknown .status-dot {
  background: #f59e0b;
}

.health-cell {
  max-width: 230px;
}

.health-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #64748b;
  font-size: 11px;
}

.health-header strong {
  color: #334155;
}

.runtime-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 11px;
}

.runtime-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  white-space: nowrap;
}

.action-buttons :deep(.el-button + .el-button) {
  margin-left: 0;
}

.action-buttons :deep(.el-button) {
  border-radius: 8px;
  font-weight: 700;
}

.logs-button {
  color: #475569;
  border-color: #dbe3ee;
  background: #ffffff;
}

.log-dialog-content {
  min-height: 180px;
}

.log-message {
  margin: 0;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
}


@media (max-width: 900px) {
  .dashboard-page {
    padding: 18px;
  }

  .dashboard-hero,
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions {
    justify-content: space-between;
  }

  .panel-meta {
    align-items: flex-start;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .service-search,
  .status-filter {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 14px;
  }

  .dashboard-hero h1 {
    font-size: 24px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .live-badge {
    justify-content: center;
  }

  .summary-card {
    min-height: 155px;
  }
}
</style>
