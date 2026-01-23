# 🚀 Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Start Typing!
- Click on the typing area to focus
- Start typing to see real-time WPM and accuracy
- Complete sessions to unlock achievements

## Optional: Add AI-Generated Content

1. Get a free API key from [OpenRouter.ai](https://openrouter.ai)
2. In the app, go to **Practice** tab
3. Scroll down to **Settings**
4. Paste your API key and click **Save**
5. Now you'll get dynamic AI-generated typing content!

## Features to Try

### Practice Modes
- **Normal**: Everyday text
- **Code**: Programming syntax
- **Literature**: Rich vocabulary
- **Technical**: Professional writing

### Dashboard
- View your WPM progress over time
- See keyboard heatmap showing your weak keys
- Check finger-specific statistics
- Track achievements and ranks

## Project Structure

```
apextype/
├── src/
│   ├── components/
│   │   ├── typing/          # Typing engine component
│   │   └── dashboard/       # Analytics components
│   ├── views/               # Main view pages
│   ├── stores/              # Pinia state management
│   ├── services/            # API services
│   └── utils/               # Helper functions
├── public/                  # Static assets
└── dist/                    # Production build
```

## Build for Production

```bash
npm run build
npm run preview
```

## Tips for Best Results

1. **Sit Properly**: Maintain good posture
2. **Home Row**: Keep fingers on home row (ASDF JKL;)
3. **Don't Look**: Try not to look at the keyboard
4. **Regular Practice**: 15-20 minutes daily for best improvement
5. **Focus on Accuracy**: Speed will come naturally

## Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### Build Errors
Make sure you're using Node.js version 16 or higher:
```bash
node --version
```

### Tailwind Styles Not Loading
Clear your browser cache and rebuild:
```bash
rm -rf dist node_modules
npm install
npm run dev
```

## Support

For issues or questions, please check the README.md or open an issue on GitHub.

---

Happy Typing! ⚡
