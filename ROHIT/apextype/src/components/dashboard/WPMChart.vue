<template>
  <div class="glass-card p-6">
    <h3 class="text-2xl font-bold mb-4">WPM Progress (Last 30 Days)</h3>
    <div class="h-64">
      <Line :data="chartData" :options="chartOptions" v-if="hasData" />
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <div class="text-center">
          <p class="text-lg">No data yet</p>
          <p class="text-sm">Complete some typing sessions to see your progress!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useStatsStore } from '../../stores/statsStore'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const statsStore = useStatsStore()

const hasData = computed(() => statsStore.wpmTrend.length > 0)

const chartData = computed(() => {
  const data = statsStore.wpmTrend

  return {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'WPM',
        data: data.map(d => d.wpm),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Accuracy',
        data: data.map(d => d.accuracy),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1'
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      labels: {
        color: '#E5E7EB'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff'
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#9CA3AF'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      ticks: {
        color: '#3B82F6'
      },
      grid: {
        color: 'rgba(59, 130, 246, 0.1)'
      },
      title: {
        display: true,
        text: 'WPM',
        color: '#3B82F6'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      ticks: {
        color: '#10B981'
      },
      grid: {
        drawOnChartArea: false
      },
      title: {
        display: true,
        text: 'Accuracy (%)',
        color: '#10B981'
      }
    }
  }
}
</script>
