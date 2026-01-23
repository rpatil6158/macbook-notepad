// Calculate WPM (Words Per Minute)
export const calculateWPM = (characters, timeInMinutes) => {
  if (timeInMinutes === 0) return 0
  return Math.round((characters / 5) / timeInMinutes)
}

// Calculate accuracy percentage
export const calculateAccuracy = (correctChars, totalChars) => {
  if (totalChars === 0) return 100
  return Math.round((correctChars / totalChars) * 100)
}

// Calculate raw KPM (Keypresses Per Minute)
export const calculateRawKPM = (keypresses, timeInMinutes) => {
  if (timeInMinutes === 0) return 0
  return Math.round(keypresses / timeInMinutes)
}

// Analyze bigrams and trigrams
export const analyzeBigrams = (text) => {
  const bigrams = {}
  for (let i = 0; i < text.length - 1; i++) {
    const bigram = text.substring(i, i + 2)
    bigrams[bigram] = (bigrams[bigram] || 0) + 1
  }
  return bigrams
}

export const analyzeTrigrams = (text) => {
  const trigrams = {}
  for (let i = 0; i < text.length - 2; i++) {
    const trigram = text.substring(i, i + 3)
    trigrams[trigram] = (trigrams[trigram] || 0) + 1
  }
  return trigrams
}

// Find most common mistakes
export const findCommonMistakes = (mistakes) => {
  const mistakeFrequency = {}
  mistakes.forEach(mistake => {
    const key = `${mistake.expectedChar} -> ${mistake.key}`
    mistakeFrequency[key] = (mistakeFrequency[key] || 0) + 1
  })
  return Object.entries(mistakeFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
}

// Keyboard layout for heatmap visualization
export const KEYBOARD_LAYOUT = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
]

// Get finger assignment for each key (for proper typing technique)
export const FINGER_MAP = {
  // Left hand
  '`': 'L-pinky', '1': 'L-pinky', 'q': 'L-pinky', 'a': 'L-pinky', 'z': 'L-pinky',
  '2': 'L-ring', 'w': 'L-ring', 's': 'L-ring', 'x': 'L-ring',
  '3': 'L-middle', 'e': 'L-middle', 'd': 'L-middle', 'c': 'L-middle',
  '4': 'L-index', '5': 'L-index', 'r': 'L-index', 't': 'L-index',
  'f': 'L-index', 'g': 'L-index', 'v': 'L-index', 'b': 'L-index',
  // Right hand
  '6': 'R-index', '7': 'R-index', 'y': 'R-index', 'u': 'R-index',
  'h': 'R-index', 'j': 'R-index', 'n': 'R-index', 'm': 'R-index',
  '8': 'R-middle', 'i': 'R-middle', 'k': 'R-middle', ',': 'R-middle',
  '9': 'R-ring', 'o': 'R-ring', 'l': 'R-ring', '.': 'R-ring',
  '0': 'R-pinky', '-': 'R-pinky', '=': 'R-pinky', 'p': 'R-pinky',
  '[': 'R-pinky', ']': 'R-pinky', '\\': 'R-pinky',
  ';': 'R-pinky', "'": 'R-pinky', '/': 'R-pinky'
}

// Analyze weak fingers
export const analyzeWeakFingers = (heatmapData) => {
  const fingerStats = {}

  Object.entries(heatmapData).forEach(([key, data]) => {
    const finger = FINGER_MAP[key.toLowerCase()]
    if (finger) {
      if (!fingerStats[finger]) {
        fingerStats[finger] = { total: 0, errors: 0, avgLatency: 0, count: 0 }
      }
      fingerStats[finger].total += data.count
      fingerStats[finger].errors += data.errors
      fingerStats[finger].avgLatency += data.avgLatency * data.count
      fingerStats[finger].count += data.count
    }
  })

  // Calculate averages
  Object.keys(fingerStats).forEach(finger => {
    fingerStats[finger].avgLatency = fingerStats[finger].avgLatency / fingerStats[finger].count
    fingerStats[finger].errorRate = (fingerStats[finger].errors / fingerStats[finger].total) * 100
  })

  return fingerStats
}

// Color coding for heatmap based on performance
export const getHeatmapColor = (latency, errorRate) => {
  if (errorRate > 10) return '#EF4444' // Red - high error rate
  if (latency > 250) return '#F59E0B' // Orange - slow
  if (latency > 150) return '#FCD34D' // Yellow - moderate
  return '#10B981' // Green - good
}

// Format time display
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Determine difficulty adjustment based on accuracy
export const adjustDifficulty = (accuracy, currentDifficulty) => {
  if (accuracy < 94 && currentDifficulty !== 'easy') {
    return 'easy'
  }
  if (accuracy >= 98 && currentDifficulty === 'easy') {
    return 'medium'
  }
  if (accuracy >= 98 && currentDifficulty === 'medium') {
    return 'hard'
  }
  return currentDifficulty
}
