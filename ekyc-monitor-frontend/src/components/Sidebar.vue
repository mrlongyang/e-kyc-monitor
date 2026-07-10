<!-- src/components/Sidebar.vue -->
<template>
  <aside class="sidebar">
    <h2>e-KYC Monitor</h2>

    <RouterLink to="/">Dashboard</RouterLink>
    <RouterLink to="/services">Services</RouterLink>
    <RouterLink to="/system">System</RouterLink>
    <RouterLink to="/logs">Logs</RouterLink>
    <RouterLink to="/alerts">Alerts</RouterLink>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: #111827;
  color: white;
  padding: 20px;
}

.sidebar a {
  display: block;
  color: white;
  text-decoration: none;
  margin: 14px 0;
}

.sidebar a.router-link-active {
  font-weight: bold;
  color: #38bdf8;
}
</style>