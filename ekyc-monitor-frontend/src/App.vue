<!-- src/App.vue -->
<template>
  <div class="layout">
    <Sidebar />

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "@/components/Sidebar.vue";
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f3f4f6;
}

.layout {
  display: flex;
}

.content {
  flex: 1;
  padding: 24px;
}
</style>