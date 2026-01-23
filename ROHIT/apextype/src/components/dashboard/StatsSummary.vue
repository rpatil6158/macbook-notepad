<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <!-- Total Sessions -->
    <div class="stat-card">
      <div class="text-sm text-gray-400 mb-1">Total Sessions</div>
      <div class="text-3xl font-bold text-blue-400">{{ statsStore.totalSessions }}</div>
    </div>

    <!-- Average WPM -->
    <div class="stat-card">
      <div class="text-sm text-gray-400 mb-1">Average WPM</div>
      <div class="text-3xl font-bold text-purple-400">{{ statsStore.averageWPM }}</div>
    </div>

    <!-- Best WPM -->
    <div class="stat-card">
      <div class="text-sm text-gray-400 mb-1">Best WPM</div>
      <div class="text-3xl font-bold text-green-400">{{ statsStore.bestWPM }}</div>
    </div>

    <!-- Average Accuracy -->
    <div class="stat-card">
      <div class="text-sm text-gray-400 mb-1">Avg Accuracy</div>
      <div class="text-3xl font-bold text-yellow-400">{{ statsStore.averageAccuracy }}%</div>
    </div>
  </div>

  <!-- Current Rank -->
  <div class="glass-card p-6 mb-8">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-semibold mb-2">Current Rank</h3>
        <div class="flex items-center gap-4">
          <span class="text-6xl">{{ statsStore.currentRank.icon }}</span>
          <div>
            <div class="text-3xl font-bold" :style="{ color: statsStore.currentRank.color }">
              {{ statsStore.currentRank.name }}
            </div>
            <div class="text-sm text-gray-400">Keep typing to reach the next level!</div>
          </div>
        </div>
      </div>

      <!-- Rank Progress -->
      <div class="text-right">
        <div class="text-sm text-gray-400 mb-2">Next Rank</div>
        <div class="text-lg font-semibold">{{ getNextRank() }}</div>
        <div class="text-sm text-gray-400">
          {{ getWPMNeeded() }} WPM needed
        </div>
      </div>
    </div>
  </div>

  <!-- Achievements -->
  <div class="glass-card p-6" v-if="statsStore.achievements.length > 0">
    <h3 class="text-xl font-semibold mb-4">Achievements ({{ statsStore.achievements.length }})</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="achievement in statsStore.achievements"
        :key="achievement.id"
        class="glass-card p-4 flex items-center gap-3 hover:scale-105 transition-transform"
      >
        <span class="text-3xl">{{ achievement.icon }}</span>
        <div>
          <div class="font-semibold">{{ achievement.name }}</div>
          <div class="text-sm text-gray-400">{{ achievement.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStatsStore } from '../../stores/statsStore'

const statsStore = useStatsStore()

const rankThresholds = [
  { name: 'Shadow-Hand', wpm: 100 },
  { name: 'Mach-1', wpm: 80 },
  { name: 'Expert', wpm: 60 },
  { name: 'Advanced', wpm: 40 },
  { name: 'Intermediate', wpm: 20 },
  { name: 'Novice', wpm: 0 }
]

const getNextRank = () => {
  const currentWPM = statsStore.averageWPM
  for (let rank of rankThresholds) {
    if (currentWPM < rank.wpm) {
      return rank.name
    }
  }
  return 'Max Rank!'
}

const getWPMNeeded = () => {
  const currentWPM = statsStore.averageWPM
  for (let rank of rankThresholds) {
    if (currentWPM < rank.wpm) {
      return rank.wpm - currentWPM
    }
  }
  return 0
}
</script>
