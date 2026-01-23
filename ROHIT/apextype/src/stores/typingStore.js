import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTypingStore = defineStore('typing', () => {
  // State
  const currentText = ref('')
  const userInput = ref('')
  const startTime = ref(null)
  const endTime = ref(null)
  const isTyping = ref(false)
  const keyPressData = ref([]) // Track each keypress with timestamp
  const mistakes = ref([]) // Track mistakes for spaced repetition
  const currentMode = ref('normal') // normal, coding, literature, technical

  // Computed metrics
  const timeElapsed = computed(() => {
    if (!startTime.value) return 0
    const end = endTime.value || Date.now()
    return (end - startTime.value) / 1000 / 60 // in minutes
  })

  const charactersTyped = computed(() => userInput.value.length)

  const wpm = computed(() => {
    if (timeElapsed.value === 0) return 0
    // WPM = (Characters / 5) / Time in minutes
    return Math.round((charactersTyped.value / 5) / timeElapsed.value)
  })

  const rawKPM = computed(() => {
    if (timeElapsed.value === 0) return 0
    return Math.round(keyPressData.value.length / timeElapsed.value)
  })

  const accuracy = computed(() => {
    if (userInput.value.length === 0) return 100
    let correctChars = 0
    for (let i = 0; i < userInput.value.length; i++) {
      if (userInput.value[i] === currentText.value[i]) {
        correctChars++
      }
    }
    return Math.round((correctChars / userInput.value.length) * 100)
  })

  const progress = computed(() => {
    if (currentText.value.length === 0) return 0
    return Math.round((userInput.value.length / currentText.value.length) * 100)
  })

  // Actions
  function startTyping() {
    if (!isTyping.value) {
      startTime.value = Date.now()
      isTyping.value = true
    }
  }

  function stopTyping() {
    endTime.value = Date.now()
    isTyping.value = false
    saveSession()
  }

  function recordKeyPress(key, isCorrect, latency) {
    keyPressData.value.push({
      key,
      isCorrect,
      latency,
      timestamp: Date.now()
    })

    if (!isCorrect) {
      mistakes.value.push({
        key,
        position: userInput.value.length,
        expectedChar: currentText.value[userInput.value.length],
        timestamp: Date.now()
      })
    }
  }

  function setText(text) {
    currentText.value = text
  }

  function setMode(mode) {
    currentMode.value = mode
  }

  function resetSession() {
    userInput.value = ''
    startTime.value = null
    endTime.value = null
    isTyping.value = false
    keyPressData.value = []
    mistakes.value = []
  }

  function saveSession() {
    // Save to localStorage
    const sessions = JSON.parse(localStorage.getItem('apextype_sessions') || '[]')
    sessions.push({
      date: new Date().toISOString(),
      wpm: wpm.value,
      accuracy: accuracy.value,
      duration: timeElapsed.value,
      mode: currentMode.value,
      mistakes: mistakes.value.length,
      rawKPM: rawKPM.value
    })
    // Keep only last 100 sessions
    if (sessions.length > 100) sessions.shift()
    localStorage.setItem('apextype_sessions', JSON.stringify(sessions))
  }

  function getHeatmapData() {
    const heatmap = {}
    keyPressData.value.forEach(kp => {
      if (!heatmap[kp.key]) {
        heatmap[kp.key] = { count: 0, avgLatency: 0, errors: 0 }
      }
      heatmap[kp.key].count++
      heatmap[kp.key].avgLatency += kp.latency
      if (!kp.isCorrect) heatmap[kp.key].errors++
    })

    // Calculate averages
    Object.keys(heatmap).forEach(key => {
      heatmap[key].avgLatency = heatmap[key].avgLatency / heatmap[key].count
    })

    return heatmap
  }

  return {
    // State
    currentText,
    userInput,
    startTime,
    endTime,
    isTyping,
    keyPressData,
    mistakes,
    currentMode,
    // Computed
    timeElapsed,
    charactersTyped,
    wpm,
    rawKPM,
    accuracy,
    progress,
    // Actions
    startTyping,
    stopTyping,
    recordKeyPress,
    setText,
    setMode,
    resetSession,
    saveSession,
    getHeatmapData
  }
})
