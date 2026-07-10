<template>
  <div class="dashboard">
    <div class="header">
      <div>
        <h1>e-KYC Monitoring Dashboard</h1>
        <p>Real-time service status and alerts</p>
      </div>

      <el-button type="primary" @click="loadData">Refresh</el-button>
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { getLiveServices } from "@/services/serviceApi";
import { getActiveAlerts } from "@/services/alertsApi";

const services = ref<any[]>([]);
const alerts = ref<any[]>([]);
let timer: number | undefined;

const runningCount = computed(() =>
  services.value.filter((s) => s.status === "running").length
);

const downCount = computed(() =>
  services.value.filter((s) => s.status !== "running").length
);

function getStatusType(status: string) {
  if (status === "running") return "success";
  if (status === "exited") return "danger";
  return "warning";
}

async function loadData() {
  services.value = await getLiveServices();
  alerts.value = await getActiveAlerts();
}

onMounted(() => {
  loadData();
  timer = window.setInterval(loadData, 30000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.dashboard {
  padding: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
}

.header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.cards {
  margin-bottom: 24px;
}

.card-title {
  color: #6b7280;
  font-size: 14px;
}

.card-number {
  font-size: 38px;
  font-weight: bold;
  margin-top: 10px;
}

.success {
  color: #16a34a;
}

.danger {
  color: #dc2626;
}

.warning {
  color: #f59e0b;
}

.alert-box {
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>