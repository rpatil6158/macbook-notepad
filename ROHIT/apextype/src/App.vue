<script setup>
import { ref } from 'vue'
import TypingView from './views/TypingView.vue'
import DashboardView from './views/DashboardView.vue'

const currentView = ref('typing')

const switchView = (view) => {
  currentView.value = view
}
</script>

<template>
  <div id="app" class="min-h-screen">
    <!-- Header -->
    <header class="glass-card mx-4 mt-4 mb-6 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="text-4xl">⚡</div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              ApexType
            </h1>
            <p class="text-xs text-gray-400">Scientific Typing Mastery</p>
          </div>
        </div>

        <nav class="flex gap-4">
          <button
            @click="switchView('typing')"
            :class="currentView === 'typing' ? 'bg-blue-600' : 'bg-gray-700'"
            class="px-6 py-2 rounded-lg hover:bg-blue-500 transition-all font-semibold"
          >
            Practice
          </button>
          <button
            @click="switchView('dashboard')"
            :class="currentView === 'dashboard' ? 'bg-blue-600' : 'bg-gray-700'"
            class="px-6 py-2 rounded-lg hover:bg-blue-500 transition-all font-semibold"
          >
            Dashboard
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 pb-8">
      <transition name="fade" mode="out-in">
        <TypingView v-if="currentView === 'typing'" key="typing" />
        <DashboardView v-else-if="currentView === 'dashboard'" key="dashboard" />
      </transition>
    </main>

    <!-- Footer -->
    <footer class="text-center py-6 text-gray-500 text-sm">
      <p>Built with Vue 3 + Vite | Powered by OpenRouter AI</p>
      <p class="mt-1">🚀 Train your fingers, master your speed</p>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.container {
  max-width: 1400px;
}
</style>
