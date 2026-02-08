#!/bin/bash
set -e

echo "🚀 Deploying Warhammer Game Tracker to VPS..."

# Build locally
echo "📦 Building..."
npm run build

# Push to GitHub
echo "🔄 Pushing to GitHub..."
git push origin main

# Deploy to VPS
echo "☁️ Deploying to 02.dho-studio.de..."
ssh -i ~/.ssh/dho_vps_ed25519 orbi@02.dho-studio.de << 'ENDSSH'
cd /opt/warhammer-game-tracker
sudo git pull origin main
sudo npm install
sudo npm run build
echo "✅ Deployment complete!"
ENDSSH

echo "🎮 Live at: https://wh40k.02.dho-studio.de"
