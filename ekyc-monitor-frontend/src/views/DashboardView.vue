<template>
  <div class="dashboard">
    <div class="header">
      <div>
        <h1>e-KYC Monitoring Dashboard</h1>
        <p>Real-time service status and alerts</p>
      </div>

      <el-button
        type="primary"
        @click="loadDashboard"
        :loading="loading"
        >Refresh</el-button>
    </div>

    <el-row :gutter="20" class="cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-title">Total Services</div>
          <div class="card-number">{{ services.length }}</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-title">Running</div>
          <div class="card-number success">{{ runningCount }}</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-title">Down</div>
          <div class="card-number danger">{{ downCount }}</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-title">Active Alerts</div>
          <div class="card-number warning">{{ alerts.length }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-alert
      v-if="downCount > 0"
      title="Critical Service Issue"
      :description="`${downCount} service(s) are currently down. Please check immediately.`"
      type="error"
      show-icon
      class="alert-box"
    />

    <el-card shadow="never">
      <template #header>
        <div class="table-header">
          <span>Service Status</span>
          <el-tag type="info">Updated every 30 seconds</el-tag>
        </div>
      </template>

      <el-table :data="services" stripe style="width: 100%">
        <el-table-column prop="name" label="Service Name" />

        <el-table-column label="Status" width="160">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Health" width="260">
          <template #default="{ row }">
            <el-progress
              :percentage="row.status === 'running' ? 100 : 0"
              :status="row.status === 'running' ? 'success' : 'exception'"
            />
          </template>
        </el-table-column>

        <el-table-column prop="raw" label="Raw Status" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  getDashboardServices,
  type ServiceStatus,
} from "../services/dashboardApi";

const services = ref<ServiceStatus[]>([]);
const alerts = ref<unknown[]>([]);
const loading = ref(false);
const errorMessage = ref("");

const runningCount = computed(() =>
  services.value.filter(
    (service) => service.status.toLowerCase() === "running",
  ).length,
);

const downCount = computed(() =>
  services.value.filter(
    (service) => service.status.toLowerCase() !== "running",
  ).length,
);

function getStatusType(status: string) {
  return status.toLowerCase() === "running" ? "success" : "danger";
}

async function loadDashboard() {
  loading.value = true;
  errorMessage.value = "";

  try {
    services.value = await getDashboardServices();
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    services.value = [];
    errorMessage.value = "Unable to load service data.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);
</script>