# ⚔️ Warhammer 40K Game Tracker

A static web app for tracking 10th edition Warhammer 40K games with automatic round management and quality-of-life features.

## 🎮 Live Demo

**[https://wh40k.02.dho-studio.de](https://wh40k.02.dho-studio.de)**

## ✨ Features

- **Battle Round Tracking:** 1-5 rounds with visual counter
- **Command Points (CP):** Auto-gain 1 CP per round
- **Victory Points (VP):** Dual player counters
- **Persistent State:** Auto-save to localStorage
- **Mobile-Friendly:** Responsive design for gaming tables

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- localStorage for persistence

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📦 Deployment

Deploy to VPS with one command:

```bash
./deploy.sh
```

This will:
1. Build the project locally
2. Push to GitHub
3. Pull on VPS and rebuild
4. Live at `https://wh40k.02.dho-studio.de`

## 🎯 Roadmap

- [ ] Phase tracker (Command → Movement → Shooting → Charge → Fight → Morale)
- [ ] Turn switcher (Player 1 ↔ Player 2)
- [ ] Undo button
- [ ] Game history log
- [ ] Dark theme refinements
- [ ] PWA support (offline, installable)

## 📄 License

MIT
