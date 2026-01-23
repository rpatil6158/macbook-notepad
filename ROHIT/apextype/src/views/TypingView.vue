<template>
  <div class="typing-view">
    <h2 class="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
      ApexType - Master Your Typing
    </h2>

    <TypingEngine />

    <!-- Settings Panel -->
    <div class="glass-card p-6 mt-8">
      <h3 class="text-xl font-semibold mb-4">Settings</h3>

      <div class="space-y-4">
        <!-- OpenRouter API Key -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">
            OpenRouter API Key (Optional - for AI-generated content)
          </label>
          <div class="flex gap-2">
            <input
              v-model="apiKey"
              type="password"
              placeholder="sk-or-v1-..."
              class="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
            <button @click="saveApiKey" class="btn-primary">
              Save
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Get your API key from <a href="https://openrouter.ai" target="_blank" class="text-blue-400 hover:underline">OpenRouter.ai</a>
          </p>
        </div>

        <!-- Info -->
        <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p class="text-sm">
            <strong>💡 Tip:</strong> Without an API key, the app will use built-in practice texts.
            With an API key, you'll get dynamic AI-generated content tailored to your weak areas!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TypingEngine from '../components/typing/TypingEngine.vue'
import aiService from '../services/aiService'

const apiKey = ref('')

const saveApiKey = () => {
  aiService.setApiKey(apiKey.value)
  alert('API Key saved successfully!')
}

onMounted(() => {
  apiKey.value = localStorage.getItem('openrouter_api_key') || ''
})
</script>
