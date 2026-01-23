import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStatsStore = defineStore('stats', () => {
  // State
  const sessions = ref([])
  const achievements = ref([])

  // Load from localStorage on init
  const loadSessions = () => {
    const saved = localStorage.getItem('apextype_sessions')
    if (saved) {
      sessions.value = JSON.parse(saved)
    }
  }

  // Computed
  const totalSessions = computed(() => sessions.value.length)

  const averageWPM = computed(() => {
    if (sessions.value.length === 0) return 0
    const sum = sessions.value.reduce((acc, s) => acc + s.wpm, 0)
    return Math.round(sum / sessions.value.length)
  })

  const bestWPM = computed(() => {
    if (sessions.value.length === 0) return 0
    return Math.max(...sessions.value.map(s => s.wpm))
  })

  const averageAccuracy = computed(() => {
    if (sessions.value.length === 0) return 0
    const sum = sessions.value.reduce((acc, s) => acc + s.accuracy, 0)
    return Math.round(sum / sessions.value.length)
  })

  const last30DaysSessions = computed(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return sessions.value.filter(s => new Date(s.date) >= thirtyDaysAgo)
  })

  const wpmTrend = computed(() => {
    return last30DaysSessions.value.map(s => ({
      date: new Date(s.date).toLocaleDateString(),
      wpm: s.wpm,
      accuracy: s.accuracy
    }))
  })

  const currentRank = computed(() => {
    const avgWPM = averageWPM.value
    if (avgWPM >= 100) return { name: 'Shadow-Hand', icon: '🥷', color: '#8B5CF6' }
    if (avgWPM >= 80) return { name: 'Mach-1', icon: '⚡', color: '#3B82F6' }
    if (avgWPM >= 60) return { name: 'Expert', icon: '🎯', color: '#10B981' }
    if (avgWPM >= 40) return { name: 'Advanced', icon: '📈', color: '#F59E0B' }
    if (avgWPM >= 20) return { name: 'Intermediate', icon: '📝', color: '#8B5CF6' }
    return { name: 'Novice', icon: '🌱', color: '#6B7280' }
  })

  // Actions
  const checkAchievements = (session) => {
    const newAchievements = []

    // First session
    if (totalSessions.value === 1) {
      newAchievements.push({
        id: 'first-session',
        name: 'First Steps',
        description: 'Complete your first typing session',
        icon: '🎉'
      })
    }

    // Speed milestones
    if (session.wpm >= 50 && !achievements.value.find(a => a.id === 'wpm-50')) {
      newAchievements.push({
        id: 'wpm-50',
        name: 'Half Century',
        description: 'Reach 50 WPM',
        icon: '🚀'
      })
    }

    if (session.wpm >= 100 && !achievements.value.find(a => a.id === 'wpm-100')) {
      newAchievements.push({
        id: 'wpm-100',
        name: 'Century Club',
        description: 'Reach 100 WPM',
        icon: '💯'
      })
    }

    // Accuracy milestones
    if (session.accuracy === 100 && !achievements.value.find(a => a.id === 'perfect')) {
      newAchievements.push({
        id: 'perfect',
        name: 'Perfectionist',
        description: 'Complete a session with 100% accuracy',
        icon: '✨'
      })
    }

    // Consistency
    if (totalSessions.value === 10 && !achievements.value.find(a => a.id === 'consistent-10')) {
      newAchievements.push({
        id: 'consistent-10',
        name: 'Dedicated',
        description: 'Complete 10 sessions',
        icon: '🔥'
      })
    }

    achievements.value.push(...newAchievements)
    if (newAchievements.length > 0) {
      localStorage.setItem('apextype_achievements', JSON.stringify(achievements.value))
    }

    return newAchievements
  }

  const loadAchievements = () => {
    const saved = localStorage.getItem('apextype_achievements')
    if (saved) {
      achievements.value = JSON.parse(saved)
    }
  }

  return {
    sessions,
    achievements,
    totalSessions,
    averageWPM,
    bestWPM,
    averageAccuracy,
    last30DaysSessions,
    wpmTrend,
    currentRank,
    loadSessions,
    checkAchievements,
    loadAchievements
  }
})
