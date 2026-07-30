<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="header">
      <div>
        <h1>e-KYC Monitoring Dashboard</h1>
        <p>Real-time service status and service controls</p>
      </div>

      <el-button
        type="primary"
        :loading="loading"
        @click="loadDashboard"
      >
        Refresh
      </el-button>
    </div>

    <!-- Summary cards -->
    <el-row :gutter="20" class="cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-title">Total Services</div>
          <div class="card-number">
            {{ monitoredServices.length }}
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-title">Running</div>
          <div class="card-number success">
            {{ runningCount }}
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-title">Down</div>
          <div class="card-number danger">
            {{ downCount }}
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="card-title">Active Alerts</div>
          <div class="card-number warning">
            {{ activeAlerts }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Dashboard loading error -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      closable
      class="alert-box"
      @close="errorMessage = ''"
    />

    <!-- Service down alert -->
    <el-alert
      v-if="downCount > 0"
      title="Critical Service Issue"
      :description="
        `${downCount} monitored service(s) are currently down. Please check immediately.`
      "
      type="error"
      show-icon
      class="alert-box"
    />

    <!-- Control success message -->
    <el-alert
      v-if="controlMessage"
      title="Service command successful"
      :description="controlMessage"
      type="success"
      show-icon
      closable
      class="alert-box"
      @close="controlMessage = ''"
    />

    <!-- Control error message -->
    <el-alert
      v-if="controlError"
      title="Service command failed"
      :description="controlError"
      type="error"
      show-icon
      closable
      class="alert-box"
      @close="controlError = ''"
    />

    <!-- Service table -->
    <el-card shadow="never">
      <template #header>
        <div class="table-header">
          <div>
            <span class="table-title">Service Status</span>

            <el-tag type="info" effect="plain">
              Updated every 30 seconds
            </el-tag>
          </div>

          <span
            v-if="lastUpdated"
            class="last-updated"
          >
            Last updated: {{ lastUpdated }}
          </span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="services"
        stripe
        style="width: 100%"
        row-key="name"
      >
        <!-- Service name -->
        <el-table-column
          prop="name"
          label="Service Name"
          min-width="180"
        >
          <template #default="{ row }">
            <div class="service-name-cell">
              <span class="service-name">
                {{ row.name }}
              </span>

              <el-tag
                v-if="!canControlService(row.name)"
                type="info"
                effect="plain"
                size="small"
              >
                Not licensed
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column
          label="Status"
          width="130"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              effect="light"
            >
              {{ normalizeStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Health -->
        <el-table-column
          label="Health"
          min-width="220"
        >
          <template #default="{ row }">
            <el-progress
              :percentage="isRunning(row.status) ? 100 : 0"
              :status="
                isRunning(row.status)
                  ? 'success'
                  : 'exception'
              "
              :stroke-width="8"
            />
          </template>
        </el-table-column>

        <!-- Raw status -->
        <el-table-column
          prop="raw"
          label="Raw Status"
          min-width="360"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="raw-status">
              {{ row.raw || "No status information" }}
            </span>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column
          label="Actions"
          width="220"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <div
              v-if="canControlService(row.name)"
              class="action-buttons"
            >
              <!-- Start -->
              <el-button
                v-if="!isRunning(row.status)"
                type="success"
                size="small"
                :loading="
                  isControlling(row.name, 'start')
                "
                :disabled="
                  isAnotherCommandRunning(row.name)
                "
                @click="
                  handleServiceControl(
                    row.name,
                    'start',
                  )
                "
              >
                Start
              </el-button>

              <!-- Stop -->
              <el-button
                v-if="isRunning(row.status)"
                type="danger"
                size="small"
                :loading="
                  isControlling(row.name, 'stop')
                "
                :disabled="
                  isAnotherCommandRunning(row.name)
                "
                @click="
                  handleServiceControl(
                    row.name,
                    'stop',
                  )
                "
              >
                Stop
              </el-button>

              <!-- Restart -->
              <el-button
                v-if="isRunning(row.status)"
                type="warning"
                size="small"
                :loading="
                  isControlling(row.name, 'restart')
                "
                :disabled="
                  isAnotherCommandRunning(row.name)
                "
                @click="
                  handleServiceControl(
                    row.name,
                    'restart',
                  )
                "
              >
                Restart
              </el-button>
            </div>

            <el-tag
              v-else
              type="info"
              effect="plain"
            >
              Disabled
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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
import axios from "axios";

import {
  getDashboardServices,
  type ServiceStatus,
} from "../services/dashboardApi";

import {
  controlService,
  type ServiceAction,
} from "../services/serviceApi";

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const services = ref<ServiceStatus[]>([]);
const loading = ref(false);
const errorMessage = ref("");

const controllingService = ref<string | null>(null);
const controlAction = ref<ServiceAction | null>(null);

const controlMessage = ref("");
const controlError = ref("");
const lastUpdated = ref("");

let refreshTimer: ReturnType<
  typeof setInterval
> | null = null;

/*
|--------------------------------------------------------------------------
| Services that should not be monitored or controlled
|--------------------------------------------------------------------------
|
| These services were not purchased from the vendor.
| They remain visible, but they are excluded from:
|
| - Running count
| - Down count
| - Alerts
| - Start, stop and restart controls
|
*/

const disabledServices = [
  "bio-fingerprint",
  "bio-gateway",
];

/*
|--------------------------------------------------------------------------
| Computed values
|--------------------------------------------------------------------------
*/

const monitoredServices = computed(() =>
  services.value.filter(
    (service) =>
      !disabledServices.includes(service.name),
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

/*
|--------------------------------------------------------------------------
| Status helpers
|--------------------------------------------------------------------------
*/

function normalizeStatus(status?: string): string {
  if (!status) {
    return "unknown";
  }

  return status.toLowerCase();
}

function isRunning(status?: string): boolean {
  return normalizeStatus(status) === "running";
}

function getStatusType(
  status?: string,
): "success" | "danger" | "warning" {
  const normalizedStatus =
    normalizeStatus(status);

  if (normalizedStatus === "running") {
    return "success";
  }

  if (normalizedStatus === "unknown") {
    return "warning";
  }

  return "danger";
}

function canControlService(
  serviceName: string,
): boolean {
  return !disabledServices.includes(serviceName);
}

/*
|--------------------------------------------------------------------------
| Button loading and disabled helpers
|--------------------------------------------------------------------------
*/

function isControlling(
  serviceName: string,
  action: ServiceAction,
): boolean {
  return (
    controllingService.value === serviceName &&
    controlAction.value === action
  );
}

function isAnotherCommandRunning(
  serviceName: string,
): boolean {
  return (
    controllingService.value !== null &&
    controllingService.value !== serviceName
  );
}

/*
|--------------------------------------------------------------------------
| Load dashboard
|--------------------------------------------------------------------------
*/

async function loadDashboard(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";

  try {
    services.value =
      await getDashboardServices();

    lastUpdated.value =
      new Date().toLocaleTimeString();
  } catch (error: unknown) {
    console.error(
      "Failed to load dashboard:",
      error,
    );

    errorMessage.value =
      "Unable to load service data.";

    if (services.value.length === 0) {
      services.value = [];
    }
  } finally {
    loading.value = false;
  }
}

/*
|--------------------------------------------------------------------------
| Control Docker service
|--------------------------------------------------------------------------
*/

async function handleServiceControl(
  serviceName: string,
  action: ServiceAction,
): Promise<void> {
  if (!canControlService(serviceName)) {
    ElMessage.warning(
      `${serviceName} is not available for control.`,
    );

    return;
  }

  const actionText =
    action.charAt(0).toUpperCase() +
    action.slice(1);

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to ${action} ${serviceName}?`,
      `${actionText} service`,
      {
        confirmButtonText: actionText,
        cancelButtonText: "Cancel",
        type:
          action === "stop"
            ? "warning"
            : "info",
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
    const response = await controlService(
      serviceName,
      action,
    );

    controlMessage.value =
      response.message ||
      `${serviceName} ${action} command completed.`;

    ElMessage.success(
      response.message ||
        `${serviceName} ${action} command completed.`,
    );

    /*
     * Docker may need a short time to update
     * the container status.
     */
    await wait(1500);

    await loadDashboard();
  } catch (error: unknown) {
    console.error(
      `Failed to ${action} ${serviceName}:`,
      error,
    );

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

/*
|--------------------------------------------------------------------------
| Error handling
|--------------------------------------------------------------------------
*/

function extractErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = (
      error.response?.data as
        | { message?: string }
        | undefined
    )?.message;

    return (
      responseMessage ||
      error.message ||
      fallbackMessage
    );
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

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

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
.dashboard {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #1f2937;
}

.header p {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 15px;
}

.cards {
  margin-bottom: 20px;
}

.cards :deep(.el-col) {
  margin-bottom: 16px;
}

.card-title {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 10px;
}

.card-number {
  color: #111827;
  font-size: 30px;
  font-weight: 700;
}

.card-number.success {
  color: #67c23a;
}

.card-number.danger {
  color: #f56c6c;
}

.card-number.warning {
  color: #e6a23c;
}

.alert-box {
  margin-bottom: 16px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.table-header > div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.last-updated {
  color: #909399;
  font-size: 12px;
}

.service-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.service-name {
  font-weight: 500;
  color: #303133;
}

.raw-status {
  color: #606266;
  font-family:
    "Courier New",
    Courier,
    monospace;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.action-buttons :deep(.el-button + .el-button) {
  margin-left: 0;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header h1 {
    font-size: 24px;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>