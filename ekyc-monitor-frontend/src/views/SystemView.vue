<template>
  <div>
    <h1>Docker Stats</h1>

    <button @click="loadStats">Refresh</button>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>CPU</th>
          <th>Memory</th>
          <th>Memory %</th>
          <th>Network</th>
          <th>Block IO</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in stats" :key="item.name">
          <td>{{ item.name }}</td>
          <td>{{ item.cpu }}</td>
          <td>{{ item.memory }}</td>
          <td>{{ item.memoryPercent }}</td>
          <td>{{ item.networkIO }}</td>
          <td>{{ item.blockIO }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getDockerStats } from "@/services/dockerApi";

const stats = ref<any[]>([]);

async function loadStats() {
  stats.value = await getDockerStats();
}

onMounted(loadStats);
</script>