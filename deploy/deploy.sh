#!/bin/bash
# ─── BookEase Deployment Script ─────────────────────────────
# Run this to deploy updates after pushing code
# Usage: ./deploy.sh

set -e

APP_DIR="/home/ubuntu/booking"

echo "→ Pulling latest code..."
cd $APP_DIR
git pull origin main

echo "→ Building backend..."
cd $APP_DIR/backend
npm install --production
npx prisma migrate deploy
npx prisma generate
npm run build

echo "→ Building frontend..."
cd $APP_DIR/frontend
npm install --production
npm run build

echo "→ Restarting services..."
pm2 restart all

echo "✓ Deployment complete!"
pm2 status
