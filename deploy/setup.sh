#!/bin/bash
# ─── BookEase EC2 Setup Script ──────────────────────────────
# Run on a fresh Ubuntu 22.04 EC2 t2.micro instance
# Usage: chmod +x setup.sh && sudo ./setup.sh

set -e

DOMAIN="bookease.com"
APP_DIR="/home/ubuntu/booking"

echo "══════════════════════════════════════════════"
echo "  BookEase Multi-Tenant Deployment Setup"
echo "══════════════════════════════════════════════"

# ─── 1. System Updates ───────────────────────────────────────
echo "→ Updating system packages..."
apt update && apt upgrade -y

# ─── 2. Install Node.js 20 LTS ──────────────────────────────
echo "→ Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ─── 3. Install Nginx ───────────────────────────────────────
echo "→ Installing Nginx..."
apt install -y nginx

# ─── 4. Install PM2 ─────────────────────────────────────────
echo "→ Installing PM2..."
npm install -g pm2

# ─── 5. Install Certbot for SSL ─────────────────────────────
echo "→ Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# ─── 6. Create log directory ────────────────────────────────
mkdir -p /home/ubuntu/logs
chown ubuntu:ubuntu /home/ubuntu/logs

# ─── 7. Firewall ────────────────────────────────────────────
echo "→ Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "══════════════════════════════════════════════"
echo "  System setup complete!"
echo "══════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Clone your repo:"
echo "   git clone <your-repo> $APP_DIR"
echo ""
echo "2. Setup backend:"
echo "   cd $APP_DIR/backend"
echo "   npm install"
echo "   cp .env.example .env   # edit with production values"
echo "   npx prisma migrate deploy"
echo "   npm run build"
echo ""
echo "3. Setup frontend:"
echo "   cd $APP_DIR/frontend"
echo "   npm install"
echo "   cp .env.local.example .env.local  # edit with production values"
echo "   npm run build"
echo ""
echo "4. Get wildcard SSL certificate:"
echo "   sudo certbot certonly --manual --preferred-challenges dns \\"
echo "     -d $DOMAIN -d '*.$DOMAIN'"
echo "   (You'll need to add a DNS TXT record for verification)"
echo ""
echo "5. Copy Nginx config:"
echo "   sudo cp $APP_DIR/deploy/nginx/bookease.conf /etc/nginx/sites-available/"
echo "   sudo ln -s /etc/nginx/sites-available/bookease.conf /etc/nginx/sites-enabled/"
echo "   sudo rm /etc/nginx/sites-enabled/default"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "6. Start the app with PM2:"
echo "   cd $APP_DIR"
echo "   pm2 start deploy/ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup  # auto-start on reboot"
echo ""
