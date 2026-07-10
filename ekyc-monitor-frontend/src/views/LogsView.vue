<!-- src/views/LogsView.vue -->
<template>
  <div>
    <h1>Logs</h1>

    <select v-model="selectedService">
      <option v-for="s in serviceNames" :key="s" :value="s">
        {{ s }}
      </option>
    </select>

    <button @click="loadLogs">Load Logs</button>

    <pre class="log-box">{{ logs }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getServiceLogs } from "@/services/logsApi";

const serviceNames = [
  "bio-assay",
  "bio-auth",
  "bio-facerecognition",
  "bio-fingerprint",
  "bio-gateway",
  "bio-oam",
  "bio-ocr",
  "bio-oss",
];

const selectedService = ref("bio-auth");
const logs = ref("");

async function loadLogs() {
  const result = await getServiceLogs(selectedService.value);
  logs.value = result.logs || result;
}
</script>

<style scoped>
select,
button {
  margin-right: 10px;
  padding: 8px;
}

.log-box {
  background: #111827;
  color: #22c55e;
  padding: 16px;
  margin-top: 20px;
  height: 500px;
  overflow: auto;
  border-radius: 8px;
}
</style>