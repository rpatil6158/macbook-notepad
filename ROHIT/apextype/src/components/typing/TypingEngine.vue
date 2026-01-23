<template>
  <div class="typing-engine glass-card p-8">
    <!-- Stats Header -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="stat-card text-center">
        <div class="text-sm text-gray-400">WPM</div>
        <div class="text-3xl font-bold text-blue-400">{{ typingStore.wpm }}</div>
      </div>
      <div class="stat-card text-center">
        <div class="text-sm text-gray-400">Accuracy</div>
        <div class="text-3xl font-bold" :class="accuracyColor">{{ typingStore.accuracy }}%</div>
      </div>
      <div class="stat-card text-center">
        <div class="text-sm text-gray-400">Raw KPM</div>
        <div class="text-3xl font-bold text-purple-400">{{ typingStore.rawKPM }}</div>
      </div>
      <div class="stat-card text-center">
        <div class="text-sm text-gray-400">Time</div>
        <div class="text-3xl font-bold text-green-400">{{ formattedTime }}</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          :style="{ width: `${typingStore.progress}%` }"
        ></div>
      </div>
      <div class="text-sm text-gray-400 mt-1 text-right">{{ typingStore.progress }}%</div>
    </div>

    <!-- Typing Area -->
    <div
      class="typing-area bg-slate-800/50 rounded-lg p-6 mb-6 min-h-[200px] relative"
      @click="focusInput"
    >
      <div class="text-display font-mono text-xl leading-relaxed select-none break-words whitespace-pre-wrap">
        <span
          v-for="(char, index) in displayChars"
          :key="index"
          :class="getCharClass(char, index)"
          class="typing-char"
        >
          {{ char.char === ' ' ? '␣' : char.char }}
        </span>
      </div>

      <!-- Cursor -->
      <div
        class="absolute w-0.5 h-6 bg-blue-400 animate-pulse"
        :style="cursorPosition"
        v-if="!isFinished"
      ></div>
    </div>

    <!-- Hidden Input -->
    <input
      ref="hiddenInput"
      v-model="typingStore.userInput"
      @input="handleInput"
      @keydown="handleKeyDown"
      @paste.prevent
      class="opacity-0 absolute"
      type="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    />

    <!-- Controls -->
    <div class="flex justify-between items-center">
      <div class="space-x-4">
        <button
          @click="generateNewText"
          class="btn-primary"
          :disabled="typingStore.isTyping"
        >
          New Text
        </button>
        <button
          @click="resetSession"
          class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all"
        >
          Reset
        </button>
      </div>

      <div class="flex gap-2">
        <button
          v-for="mode in modes"
          :key="mode.value"
          @click="changeMode(mode.value)"
          :class="typingStore.currentMode === mode.value ? 'bg-blue-600' : 'bg-gray-700'"
          class="px-4 py-2 rounded-lg hover:bg-blue-500 transition-all text-sm"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <!-- Results Modal -->
    <div
      v-if="isFinished"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="closeResults"
    >
      <div class="glass-card p-8 max-w-2xl w-full mx-4">
        <h2 class="text-3xl font-bold mb-6 text-center">Session Complete! 🎉</h2>

        <div class="grid grid-cols-2 gap-6 mb-6">
          <div class="stat-card">
            <div class="text-gray-400 text-sm">Words Per Minute</div>
            <div class="text-4xl font-bold text-blue-400">{{ finalStats.wpm }}</div>
          </div>
          <div class="stat-card">
            <div class="text-gray-400 text-sm">Accuracy</div>
            <div class="text-4xl font-bold text-green-400">{{ finalStats.accuracy }}%</div>
          </div>
          <div class="stat-card">
            <div class="text-gray-400 text-sm">Characters Typed</div>
            <div class="text-4xl font-bold text-purple-400">{{ finalStats.characters }}</div>
          </div>
          <div class="stat-card">
            <div class="text-gray-400 text-sm">Time Elapsed</div>
            <div class="text-4xl font-bold text-green-400">{{ finalStats.time }}</div>
          </div>
        </div>

        <div v-if="newAchievements.length > 0" class="mb-6">
          <h3 class="text-xl font-semibold mb-3">New Achievements!</h3>
          <div class="space-y-2">
            <div
              v-for="achievement in newAchievements"
              :key="achievement.id"
              class="glass-card p-4 flex items-center gap-3"
            >
              <span class="text-3xl">{{ achievement.icon }}</span>
              <div>
                <div class="font-semibold">{{ achievement.name }}</div>
                <div class="text-sm text-gray-400">{{ achievement.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button @click="tryAgain" class="btn-primary flex-1">
            Try Again
          </button>
          <button @click="closeResults" class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex-1">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTypingStore } from '../../stores/typingStore'
import { useStatsStore } from '../../stores/statsStore'
import { formatTime } from '../../utils/typingUtils'
import aiService from '../../services/aiService'

const typingStore = useTypingStore()
const statsStore = useStatsStore()

const hiddenInput = ref(null)
const isFinished = ref(false)
const finalStats = ref({})
const newAchievements = ref([])
const keyPressTime = ref(0)

const modes = [
  { label: 'Normal', value: 'normal' },
  { label: 'Code', value: 'coding' },
  { label: 'Literature', value: 'literature' },
  { label: 'Technical', value: 'technical' }
]

const displayChars = computed(() => {
  return typingStore.currentText.split('').map((char, index) => ({
    char,
    index
  }))
})

const accuracyColor = computed(() => {
  const acc = typingStore.accuracy
  if (acc >= 98) return 'text-green-400'
  if (acc >= 94) return 'text-yellow-400'
  return 'text-red-400'
})

const formattedTime = computed(() => {
  return formatTime(typingStore.timeElapsed * 60)
})

const cursorPosition = computed(() => {
  const index = typingStore.userInput.length
  // Approximate cursor position (this is simplified)
  const x = (index % 50) * 12 // Rough estimate
  const y = Math.floor(index / 50) * 32
  return {
    left: `${x}px`,
    top: `${y}px`
  }
})

const getCharClass = (char, index) => {
  const userChar = typingStore.userInput[index]

  if (index === typingStore.userInput.length) {
    return 'typing-char-current'
  }

  if (index < typingStore.userInput.length) {
    return userChar === char.char ? 'typing-char-correct' : 'typing-char-incorrect'
  }

  return 'text-gray-300'
}

const focusInput = () => {
  hiddenInput.value?.focus()
}

const handleKeyDown = (e) => {
  keyPressTime.value = Date.now()

  // Prevent backspace in hard mode (optional)
  // if (e.key === 'Backspace' && hardMode.value) {
  //   e.preventDefault()
  // }
}

const handleInput = () => {
  if (!typingStore.isTyping) {
    typingStore.startTyping()
  }

  const latency = Date.now() - keyPressTime.value
  const currentIndex = typingStore.userInput.length - 1
  const expectedChar = typingStore.currentText[currentIndex]
  const typedChar = typingStore.userInput[currentIndex]

  typingStore.recordKeyPress(
    typedChar,
    typedChar === expectedChar,
    latency
  )

  // Check if finished
  if (typingStore.userInput.length === typingStore.currentText.length) {
    finishSession()
  }
}

const finishSession = () => {
  typingStore.stopTyping()
  isFinished.value = true

  finalStats.value = {
    wpm: typingStore.wpm,
    accuracy: typingStore.accuracy,
    characters: typingStore.charactersTyped,
    time: formattedTime.value
  }

  // Check for achievements
  const session = {
    wpm: typingStore.wpm,
    accuracy: typingStore.accuracy
  }
  newAchievements.value = statsStore.checkAchievements(session)
}

const resetSession = () => {
  typingStore.resetSession()
  isFinished.value = false
  newAchievements.value = []
  focusInput()
}

const closeResults = () => {
  isFinished.value = false
  newAchievements.value = []
  resetSession()
}

const tryAgain = () => {
  isFinished.value = false
  newAchievements.value = []
  typingStore.resetSession()
  focusInput()
}

const generateNewText = async () => {
  resetSession()
  const text = await aiService.generateText({
    mode: typingStore.currentMode,
    wordCount: 50
  })
  typingStore.setText(text)
  focusInput()
}

const changeMode = async (mode) => {
  typingStore.setMode(mode)
  await generateNewText()
}

onMounted(async () => {
  // Load initial text
  const text = await aiService.generateText({ mode: 'normal' })
  typingStore.setText(text)
  focusInput()

  // Load saved sessions
  statsStore.loadSessions()
  statsStore.loadAchievements()
})

// Auto-focus when component is visible
watch(() => isFinished.value, (newVal) => {
  if (!newVal) {
    setTimeout(focusInput, 100)
  }
})
</script>

<style scoped>
.typing-char {
  transition: all 0.1s ease;
}

.typing-area {
  cursor: text;
}
</style>
