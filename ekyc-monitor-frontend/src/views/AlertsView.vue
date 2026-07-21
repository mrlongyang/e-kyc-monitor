<!-- src/views/AlertsView.vue -->
<template>
  <div>
    <h1>Alerts</h1>

    <button @click="loadAlerts">Refresh</button>

    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Message</th>
          <th>Severity</th>
          <th>Time</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="alert in alerts" :key="alert.id">
          <td>{{ alert.serviceName }}</td>
          <td>{{ alert.message }}</td>
          <td :class="alert.severity">{{ alert.severity }}</td>
          <td>{{ alert.createdAt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getActiveAlerts } from "@/services/alertsApi";

const alerts = ref<any[]>([]);

async function loadAlerts() {
  alerts.value = await getActiveAlerts();
}

onMounted(loadAlerts);
</script>

<style scoped>
table {
  width: 100%;
  background: white;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.critical {
  color: red;
  font-weight: bold;
}

.warning {
  color: orange;
  font-weight: bold;
}
</style>