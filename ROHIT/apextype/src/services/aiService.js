import axios from 'axios'

class AIService {
  constructor() {
    // Priority: localStorage > environment variable
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY || ''
    const storageKey = localStorage.getItem('openrouter_api_key') || ''

    this.apiKey = storageKey || (envKey !== 'your_api_key_here' ? envKey : '')
    this.baseURL = 'https://openrouter.ai/api/v1'

    // If env key exists and no storage key, save it to localStorage
    if (!storageKey && envKey && envKey !== 'your_api_key_here') {
      localStorage.setItem('openrouter_api_key', envKey)
    }
  }

  setApiKey(key) {
    this.apiKey = key
    localStorage.setItem('openrouter_api_key', key)
  }

  hasApiKey() {
    return this.apiKey.length > 0
  }

  async generateText(options = {}) {
    const {
      mode = 'normal',
      difficulty = 'medium',
      weakKeys = [],
      wordCount = 50,
      includeSymbols = false,
      includingNumbers = false
    } = options

    if (!this.hasApiKey()) {
      // Fallback to built-in text if no API key
      return this.getFallbackText(mode, wordCount)
    }

    const systemPrompt = this.buildSystemPrompt(mode, difficulty, weakKeys, includeSymbols, includingNumbers)

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Generate a ${wordCount}-word typing practice text.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'ApexType'
          }
        }
      )

      return response.data.choices[0].message.content.trim()
    } catch (error) {
      console.error('AI generation failed:', error)
      return this.getFallbackText(mode, wordCount)
    }
  }

  buildSystemPrompt(mode, difficulty, weakKeys, includeSymbols, includeNumbers) {
    let prompt = `You are a typing practice text generator. Generate natural, flowing text that is pleasant to type.`

    // Mode-specific instructions
    switch (mode) {
      case 'coding':
        prompt += ` Generate code snippets in popular programming languages (JavaScript, Python, or Java). Include realistic variable names, function calls, and syntax.`
        break
      case 'literature':
        prompt += ` Generate literary prose with rich vocabulary and varied sentence structures. Make it engaging and descriptive.`
        break
      case 'technical':
        prompt += ` Generate technical documentation or professional business writing. Use industry terminology and formal language.`
        break
      case 'quotes':
        prompt += ` Generate inspirational or famous quotes from various authors and thinkers.`
        break
      default:
        prompt += ` Generate casual, everyday English text with common words and natural phrasing.`
    }

    // Difficulty adjustments
    if (difficulty === 'easy') {
      prompt += ` Use simple, common words and short sentences.`
    } else if (difficulty === 'hard') {
      prompt += ` Use complex vocabulary, longer sentences, and varied punctuation.`
    }

    // Weak keys focus
    if (weakKeys.length > 0) {
      prompt += ` Try to include more words containing these letters: ${weakKeys.join(', ')}.`
    }

    // Symbols and numbers
    if (includeSymbols) {
      prompt += ` Include common symbols like @, #, $, %, &, *, (, ), -, _, +, =, etc.`
    }

    if (includeNumbers) {
      prompt += ` Include numbers naturally in the text.`
    }

    prompt += ` The text should be exactly as requested without any introduction or explanation. Just provide the typing practice text.`

    return prompt
  }

  getFallbackText(mode, wordCount) {
    const fallbacks = {
      normal: [
        "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
        "Practice makes perfect when it comes to typing. The more you type, the faster and more accurate you will become over time.",
        "Typing is an essential skill in the modern digital world. Whether you're writing emails, coding, or chatting with friends, good typing skills make everything easier.",
      ],
      coding: [
        "function calculateSum(arr) { return arr.reduce((acc, num) => acc + num, 0); }",
        "const greeting = (name) => { console.log(`Hello, ${name}!`); return true; }",
        "class User { constructor(name, email) { this.name = name; this.email = email; } }",
      ],
      literature: [
        "In the depths of winter, I finally learned that within me there lay an invincible summer, a warmth that could not be extinguished by the cold.",
        "The sunset painted the sky in brilliant shades of orange and purple, casting long shadows across the meadow where children played.",
      ],
      technical: [
        "The application programming interface (API) facilitates communication between different software components using standardized protocols and data formats.",
        "Cloud computing enables on-demand access to shared computing resources, including servers, storage, and applications, delivered over the internet.",
      ]
    }

    const texts = fallbacks[mode] || fallbacks.normal
    return texts[Math.floor(Math.random() * texts.length)]
  }

  // Generate text based on user's weak areas
  async generateAdaptiveText(heatmapData, wordCount = 50) {
    // Find keys with highest error rate or latency
    const weakKeys = Object.entries(heatmapData)
      .filter(([key, data]) => data.errors > 2 || data.avgLatency > 200)
      .map(([key]) => key)
      .slice(0, 5)

    return this.generateText({
      mode: 'normal',
      difficulty: 'medium',
      weakKeys,
      wordCount
    })
  }
}

export default new AIService()
