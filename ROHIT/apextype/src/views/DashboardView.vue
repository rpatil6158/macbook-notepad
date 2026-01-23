<template>
  <div class="dashboard-view">
    <h2 class="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
      Analytics Dashboard
    </h2>

    <StatsSummary />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <WPMChart />
      <KeyboardHeatmap />
    </div>
  </div>
</template>

<script setup>
import StatsSummary from '../components/dashboard/StatsSummary.vue'
import WPMChart from '../components/dashboard/WPMChart.vue'
import KeyboardHeatmap from '../components/dashboard/KeyboardHeatmap.vue'
</script>
