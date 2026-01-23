<template>
  <div class="glass-card p-6">
    <h3 class="text-2xl font-bold mb-4">Keyboard Heatmap</h3>
    <p class="text-sm text-gray-400 mb-6">
      Color indicates performance: <span class="text-green-400">Green = Good</span>,
      <span class="text-yellow-400">Yellow = Moderate</span>,
      <span class="text-red-400">Red = Needs Practice</span>
    </p>

    <div class="keyboard-heatmap">
      <div
        v-for="(row, rowIndex) in keyboardLayout"
        :key="rowIndex"
        class="keyboard-row flex gap-1 mb-2 justify-center"
      >
        <div
          v-for="key in row"
          :key="key"
          :style="getKeyStyle(key)"
          class="keyboard-key flex items-center justify-center min-w-[40px] h-12 font-mono text-sm relative group"
        >
          {{ key.toUpperCase() }}

          <!-- Tooltip -->
          <div
            v-if="heatmapData[key]"
            class="absolute bottom-full mb-2 hidden group-hover:block bg-black/90 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-10"
          >
            <div>Presses: {{ heatmapData[key].count }}</div>
            <div>Errors: {{ heatmapData[key].errors }}</div>
            <div>Avg Speed: {{ Math.round(heatmapData[key].avgLatency) }}ms</div>
            <div>Error Rate: {{ getErrorRate(key) }}%</div>
          </div>
        </div>
      </div>

      <!-- Space bar -->
      <div class="flex justify-center mt-2">
        <div
          :style="getKeyStyle(' ')"
          class="keyboard-key min-w-[300px] h-12 flex items-center justify-center group relative"
        >
          SPACE

          <!-- Tooltip for spacebar -->
          <div
            v-if="heatmapData[' ']"
            class="absolute bottom-full mb-2 hidden group-hover:block bg-black/90 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-10"
          >
            <div>Presses: {{ heatmapData[' '].count }}</div>
            <div>Errors: {{ heatmapData[' '].errors }}</div>
            <div>Avg Speed: {{ Math.round(heatmapData[' '].avgLatency) }}ms</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Finger Analysis -->
    <div class="mt-8">
      <h4 class="text-xl font-semibold mb-4">Finger Performance</h4>
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="(stats, finger) in fingerStats"
          :key="finger"
          class="glass-card p-4"
        >
          <div class="font-semibold mb-2">{{ formatFingerName(finger) }}</div>
          <div class="text-sm space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-400">Presses:</span>
              <span>{{ stats.total }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Error Rate:</span>
              <span :class="getErrorRateColor(stats.errorRate)">
                {{ stats.errorRate.toFixed(1) }}%
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Avg Speed:</span>
              <span>{{ Math.round(stats.avgLatency) }}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTypingStore } from '../../stores/typingStore'
import { KEYBOARD_LAYOUT, getHeatmapColor, analyzeWeakFingers } from '../../utils/typingUtils'

const typingStore = useTypingStore()

const keyboardLayout = KEYBOARD_LAYOUT

const heatmapData = computed(() => {
  return typingStore.getHeatmapData()
})

const fingerStats = computed(() => {
  return analyzeWeakFingers(heatmapData.value)
})

const getKeyStyle = (key) => {
  const data = heatmapData.value[key]
  if (!data) {
    return {
      backgroundColor: '#334155',
      borderColor: '#475569'
    }
  }

  const errorRate = (data.errors / data.count) * 100
  const color = getHeatmapColor(data.avgLatency, errorRate)

  return {
    backgroundColor: color,
    borderColor: color,
    color: '#fff',
    fontWeight: 'bold'
  }
}

const getErrorRate = (key) => {
  const data = heatmapData.value[key]
  if (!data || data.count === 0) return 0
  return ((data.errors / data.count) * 100).toFixed(1)
}

const getErrorRateColor = (rate) => {
  if (rate < 5) return 'text-green-400'
  if (rate < 10) return 'text-yellow-400'
  return 'text-red-400'
}

const formatFingerName = (finger) => {
  return finger.replace('L-', 'Left ').replace('R-', 'Right ').replace('-', ' ')
}
</script>

<style scoped>
.keyboard-row {
  display: flex;
}

.keyboard-key {
  transition: transform 0.2s, box-shadow 0.2s;
}

.keyboard-key:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
