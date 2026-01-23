# ⚡ ApexType - Master Your Typing Speed

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**ApexType** is a high-performance, AI-driven typing tutor designed to transform your typing from basic drills to expert-level fluidity. Built with Vue 3 and powered by scientific progressions focusing on muscle memory, bigram/trigram frequency, and optional LLM integration.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Dashboard](#-analytics-dashboard) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

ApexType bridges the gap between conventional typing tutors and professional-grade typing mastery. It combines real-time analytics, visual feedback, and optional AI-generated content to create a personalized learning experience that adapts to your skill level.

### Why ApexType?

- **Scientific Approach**: Focus on muscle memory through bigram/trigram frequency training
- **Real-time Feedback**: Instant visual cues for every keystroke
- **Comprehensive Analytics**: Track progress with detailed metrics and heatmaps
- **AI-Powered Content**: Optional integration with OpenRouter for dynamic, contextual practice
- **Beautiful UI**: Modern glassmorphic design with smooth animations

---

## ✨ Features

### 🎯 Core Typing Engine

- **Real-time Performance Metrics**
  - Live WPM (Words Per Minute) calculation
  - Instant accuracy percentage
  - Raw KPM (Keypresses Per Minute) tracking
  - Session timer with millisecond precision

- **Visual Feedback System**
  - Professional cursor animation
  - Color-coded character highlighting (correct/incorrect/current)
  - Progress bar showing completion percentage
  - Smooth transitions and animations

- **Multiple Practice Modes**
  - 📝 **Normal**: Everyday English conversation and prose
  - 💻 **Code**: JavaScript, Python, Java syntax patterns
  - 📚 **Literature**: Rich vocabulary and descriptive writing
  - 🔧 **Technical**: Professional documentation and technical writing

### 📊 Analytics Dashboard

- **Progress Visualization**
  - 30-day WPM trend chart with Chart.js
  - Historical performance tracking
  - Visual progress indicators

- **Keyboard Heatmap**
  - Color-coded key performance visualization
  - Per-key latency tracking
  - Error rate per key
  - Identifies weak fingers and problematic keys

- **Finger Analysis**
  - Individual finger statistics
  - Strength/weakness identification
  - Targeted improvement suggestions

- **Achievement System**
  - Unlockable ranks: Novice → Shadow-Hand
  - Session-based achievements
  - Performance milestones
  - Motivational badges

### 🤖 AI Integration (Optional)

- **OpenRouter API Support**
  - Generate dynamic typing content using Claude, GPT, or other models
  - Context-aware text generation
  - Adaptive difficulty based on your weak areas

- **Intelligent Fallback**
  - Built-in high-quality practice texts
  - Works perfectly without API key
  - No internet required for offline practice

### 🧪 Scientific Training Features

- **Heatmap Analysis**: Visual keyboard tracking every keypress
- **Spaced Repetition**: Auto-reinforce frequently missed words
- **Bigram/Trigram Focus**: Target common letter combinations
- **Adaptive Difficulty**: Auto-adjust based on 94% accuracy threshold
- **Muscle Memory Building**: Scientific key combination patterns

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Vue 3 (Composition API) |
| **Build Tool** | Vite 7.2+ |
| **Styling** | Tailwind CSS 3.4+ |
| **State Management** | Pinia 3.0+ |
| **Charts** | Chart.js + vue-chartjs |
| **Animations** | @vueuse/motion |
| **HTTP Client** | Axios |
| **AI API** | OpenRouter (optional) |
| **Storage** | LocalStorage API |

---

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup Instructions

```bash
# Clone the repository
git clone <repository-url>
cd apextype

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

---

## 🎮 Usage

### Getting Started

1. **Launch the Application**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173`

2. **Start Typing Immediately**
   - Click on the typing area
   - Start typing the displayed text
   - Watch your metrics update in real-time

3. **Choose Your Mode**
   - Select from Normal, Code, Literature, or Technical
   - Each mode provides specialized vocabulary

4. **Track Your Progress**
   - Click "Dashboard" to view detailed analytics
   - Review your keyboard heatmap
   - Check finger-specific statistics
   - See your achievements and rank

### Controls

- **New Text**: Generate new practice text
- **Reset**: Restart current session
- **Mode Buttons**: Switch between practice modes
- **Click Typing Area**: Focus input for typing

---

## 🔑 OpenRouter API Setup (Optional)

Enhance your practice with AI-generated content tailored to your skill level.

### Steps:

1. **Get API Key**
   - Visit [OpenRouter.ai](https://openrouter.ai)
   - Sign up for an account
   - Generate an API key from dashboard

2. **Configure ApexType**
   - Open ApexType in browser
   - Scroll to **Settings** section
   - Paste your API key in the input field
   - Click **Save**

3. **Enjoy AI Content**
   - AI will generate custom typing content
   - Text adapts to your weak areas
   - Dynamic difficulty adjustment

### API Key Storage

- Stored securely in browser's LocalStorage
- Never sent to any server except OpenRouter
- Can be removed anytime

---

## 📁 Project Structure

```
apextype/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Vue components
│   │   ├── dashboard/  # Dashboard-specific components
│   │   │   ├── WPMChart.vue
│   │   │   ├── KeyboardHeatmap.vue
│   │   │   └── StatsSummary.vue
│   │   └── typing/     # Typing engine components
│   │       └── TypingEngine.vue
│   ├── services/       # API and business logic
│   │   └── aiService.js
│   ├── stores/         # Pinia state management
│   │   ├── typingStore.js
│   │   └── statsStore.js
│   ├── utils/          # Helper functions
│   │   └── typingUtils.js
│   ├── views/          # Page views
│   │   ├── TypingView.vue
│   │   └── DashboardView.vue
│   ├── App.vue         # Root component
│   ├── main.js         # Entry point
│   └── style.css       # Global styles
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── README.md          # This file
```

---

## 🎨 Customization

### Styling

ApexType uses Tailwind CSS with custom theme extensions.

**Customize Colors:**
Edit `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add your custom colors
      }
    }
  }
}
```

**Custom Component Styles:**
Edit `src/style.css`:
```css
@layer components {
  .typing-char {
    /* Modify character styling */
  }
}
```

### Typing Modes

Add new practice modes in `src/services/aiService.js` and update the mode selector in `TypingEngine.vue`.

---

## 📈 Metrics & Rank System

### Performance Metrics

| Metric | Description | Formula |
|--------|-------------|---------|
| **WPM** | Words Per Minute | (Characters ÷ 5) ÷ Time(minutes) |
| **Accuracy** | Percentage correct | (Correct ÷ Total) × 100 |
| **Raw KPM** | Keypresses/Minute | Total Keypresses ÷ Time(minutes) |
| **Progress** | Session completion | (Typed ÷ Total) × 100 |

### Rank System

| Rank | WPM Range | Icon | Description |
|------|-----------|------|-------------|
| **Shadow-Hand** | 100+ | 🥷 | Legendary typing master |
| **Mach-1** | 80-99 | ⚡ | Lightning-fast typist |
| **Expert** | 60-79 | 🎯 | Highly proficient |
| **Advanced** | 40-59 | 📈 | Strong typing skills |
| **Intermediate** | 20-39 | 📝 | Developing proficiency |
| **Novice** | 0-19 | 🌱 | Beginning journey |

---

## 🏆 Achievements

Unlock achievements as you progress:

- 🌟 **First Steps**: Complete your first typing session
- 💪 **Half Century**: Reach 50 WPM
- 🔥 **Century Club**: Reach 100 WPM
- ✨ **Perfectionist**: Achieve 100% accuracy
- 🎯 **Dedicated**: Complete 10 sessions
- 🚀 **Marathon**: Type 1000 total words
- 👑 **Consistency King**: 7-day streak
- 🎓 **All Rounder**: Try all practice modes

---

## 📊 Keyboard Heatmap Guide

The keyboard heatmap uses color coding to show key performance:

- 🟢 **Green**: Excellent performance (fast + accurate)
- 🟡 **Yellow**: Moderate performance (needs practice)
- 🔴 **Red**: Poor performance (slow or error-prone)
- ⚪ **Gray**: No data yet (key not typed)

**Use the heatmap to:**
- Identify weak fingers
- Find problematic key combinations
- Track improvement over time
- Focus practice on specific keys

---

## 🔧 Troubleshooting

### Common Issues

**Q: Typing area not responding to keyboard input?**
- Click directly on the typing area to focus
- Ensure no browser extensions are blocking input
- Try refreshing the page

**Q: API key not saving?**
- Check browser LocalStorage is enabled
- Ensure no private/incognito mode restrictions
- Clear cache and try again

**Q: Charts not displaying in Dashboard?**
- Complete at least one typing session first
- Check browser console for errors
- Verify Chart.js loaded correctly

**Q: Text not wrapping properly?**
- Clear browser cache
- Ensure latest version is running
- Check browser zoom is at 100%

### Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |

---

## 🚀 Deployment

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

```bash
npm run build
# Push dist folder to gh-pages branch
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open Pull Request**

### Development Guidelines

- Follow Vue 3 Composition API patterns
- Use Tailwind CSS for styling
- Maintain code comments for complex logic
- Test across multiple browsers
- Update documentation for new features

---

## 📝 Roadmap

Future enhancements planned:

- [ ] Multiplayer typing races
- [ ] Custom text import
- [ ] More language support
- [ ] Sound effects and haptic feedback
- [ ] Dark/Light theme toggle
- [ ] Mobile app version
- [ ] Cloud sync for progress
- [ ] Leaderboards
- [ ] More detailed finger training
- [ ] Typing exercises for specific weaknesses

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 ApexType

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgments

Built with modern web technologies:

- **Vue.js** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Simple yet flexible JavaScript charting
- **OpenRouter** - Unified AI model API
- **Pinia** - Intuitive Vue state management

Special thanks to the open-source community!

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Website**: [Your Website]

---

<div align="center">

**⚡ Train your fingers, master your speed! 🚀**

Made with ❤️ using Vue 3 + Vite + Tailwind CSS

</div>
