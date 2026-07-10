<!-- src/views/ServicesView.vue -->
<template>
  <div>
    <h1>Services</h1>

    <button @click="loadServices">Refresh</button>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Raw</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="service in services" :key="service.name">
          <td>{{ service.name }}</td>
          <td :class="service.status">{{ service.status }}</td>
          <td>{{ service.raw }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getLiveServices } from "@/services/serviceApi";

const services = ref<any[]>([]);

async function loadServices() {
  services.value = await getLiveServices();
}

onMounted(loadServices);
</script>

<style scoped>
button {
  margin-bottom: 16px;
}

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

.running {
  color: green;
  font-weight: bold;
}

.exited,
.unknown {
  color: red;
  font-weight: bold;
}
</style>