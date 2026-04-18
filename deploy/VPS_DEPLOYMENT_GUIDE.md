# BookEase VPS Deployment Guide — Option B

**VPS + Neon (free DB with auto-backups) + VPS disk for images**

Total cost: **~$5/month**

```
┌──────────────────────────────────────┐
│  Hetzner VPS CX22 — €4.35/month     │
│                                      │
│  ┌────────────┐  ┌────────────────┐  │
│  │ Next.js    │  │ Express API    │  │
│  │ port 3000  │  │ port 5000      │  │
│  └──────┬─────┘  └──────┬─────────┘  │
│         │               │            │
│  ┌──────┴───────────────┴─────────┐  │
│  │  Nginx (reverse proxy + SSL)   │  │
│  │  bookease.com → :3000          │  │
│  │  *.bookease.com → :3000        │  │
│  │  api.bookease.com → :5000      │  │
│  └────────────────────────────────┘  │
│                                      │
│  /uploads/ → images on disk          │
│  PM2 → keeps everything alive        │
└──────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│  Neon PostgreSQL (free, remote)      │
│  Auto-backups, 0.5GB, always free    │
└──────────────────────────────────────┘
```

| Service           | Cost          |
|-------------------|---------------|
| Hetzner VPS CX22  | €4.35/month   |
| Neon PostgreSQL    | Free          |
| Let's Encrypt SSL  | Free          |
| Domain (.com)      | ~$10/year     |
| **Total**          | **~$5/month** |

---

## PART 1 — ACCOUNTS & PREPARATION

### 1.1 Buy a Domain

If you don't have one yet, buy from:
- **Namecheap** — cheapest (.com ~$9/year)
- **Cloudflare Registrar** — at-cost pricing (~$10/year), easiest for DNS

For this guide, we'll use `bookease.com` as the example domain.
Replace it everywhere with your actual domain.

### 1.2 Create Neon Database

1. Go to **https://neon.tech**
2. Sign up with GitHub or email
3. Click **"New Project"**
4. Settings:
   - **Project name:** `bookease`
   - **Region:** Pick the closest to your VPS location
   - **PostgreSQL version:** 16 (latest)
5. Click **Create Project**
6. On the dashboard, copy the **connection string**:
   ```
   postgresql://neondb_owner:abc123@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
7. **Save this string** — you'll need it in Step 5

### 1.3 Create Hetzner VPS

1. Go to **https://www.hetzner.com/cloud**
2. Sign up → Create a new **Project**
3. Click **"Add Server"**
4. Configure:
   - **Location:** Pick based on your users:
     - US users → `Ashburn, VA`
     - EU users → `Nuremberg` or `Helsinki`
     - Asia users → `Singapore`
   - **Image:** `Ubuntu 22.04`
   - **Type:** `Shared vCPU` → `CX22` (2 vCPU, 4GB RAM, 40GB SSD) — €4.35/month
   - **Networking:** Leave defaults (Public IPv4 + IPv6)
   - **SSH Key:** Click "Add SSH Key" (see below)
   - **Name:** `bookease`
5. Click **"Create & Buy Now"**
6. **Note the IP address** shown (e.g., `65.109.123.45`)

#### Generate SSH Key (if you don't have one)

On your **local machine** (Windows PowerShell, Mac/Linux Terminal):

```bash
ssh-keygen -t ed25519 -C "your@email.com"
```

Press Enter for all prompts (default location, no passphrase is fine).

```bash
# Print the public key
cat ~/.ssh/id_ed25519.pub
```

Copy the output and paste it into Hetzner's "Add SSH Key" dialog.

### 1.4 Set Up DNS Records

Go to your domain registrar's DNS settings and add these records:

```
Type    Name    Value              TTL
─────   ─────   ────────────────   ────
A       @       65.109.123.45      3600
A       *       65.109.123.45      3600
A       api     65.109.123.45      3600
```

Replace `65.109.123.45` with your actual VPS IP.

**What each record does:**
- `@` → `bookease.com` (main site / landing page)
- `*` → `*.bookease.com` (wildcard — all tenant subdomains)
- `api` → `api.bookease.com` (backend API)

**Verify DNS propagation** (wait 5-10 minutes, then):
```bash
ping bookease.com
ping anything.bookease.com
ping api.bookease.com
```

All should resolve to your VPS IP.

---

## PART 2 — SERVER SETUP

### 2.1 Connect to Your VPS

```bash
ssh root@65.109.123.45
```

(Replace with your VPS IP)

You should see the Ubuntu welcome message.

### 2.2 Update the System

```bash
apt update && apt upgrade -y
```

### 2.3 Create a Non-Root User

Running everything as `root` is a security risk. Create a `deploy` user:

```bash
# Create user
adduser deploy
# Enter a strong password when prompted. Press Enter for the rest.

# Give sudo access
usermod -aG sudo deploy

# Copy SSH key so you can SSH as deploy user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Test in a **new terminal window** (don't close the current one):
```bash
ssh deploy@65.109.123.45
```

If it works, continue as the `deploy` user. If not, stay as root and debug.

### 2.4 Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:
```bash
node -v    # v20.x.x
npm -v     # 10.x.x
```

### 2.5 Install Nginx, Git, Certbot, PM2

```bash
sudo apt install -y nginx git certbot python3-certbot-nginx ufw
sudo npm install -g pm2
```

### 2.6 Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

Output should show:
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

### 2.7 Add Swap Space (Prevents Out-of-Memory)

The CX22 has 4GB RAM. Adding swap ensures builds don't crash:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
# Should show 2G swap
```

---

## PART 3 — DEPLOY YOUR CODE

### 3.1 Clone the Repository

```bash
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www

git clone https://github.com/YOUR_USERNAME/booking.git bookease
cd bookease
```

> **Private repo?** Generate a GitHub personal access token:
> https://github.com/settings/tokens → Generate new token (classic) → Select `repo` scope
> ```bash
> git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/booking.git bookease
> ```

### 3.2 Set Up Backend

```bash
cd /var/www/bookease/backend
npm install
```

Create environment file:

```bash
nano .env
```

Paste the following — **replace every placeholder with your actual values**:

```env
# ═══════════════════════════════════════════
# DATABASE (Neon — paste your connection string)
# ═══════════════════════════════════════════
DATABASE_URL=postgresql://neondb_owner:xxxx@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# ═══════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════
JWT_SECRET=REPLACE_WITH_64_CHAR_RANDOM_STRING
JWT_EXPIRES_IN=7d

# ═══════════════════════════════════════════
# ENCRYPTION (must be exactly 32 characters)
# ═══════════════════════════════════════════
ENCRYPTION_KEY=REPLACE_WITH_32_CHAR_RANDOM_STRING

# ═══════════════════════════════════════════
# SERVER
# ═══════════════════════════════════════════
PORT=5000
NODE_ENV=production

# ═══════════════════════════════════════════
# URLS (replace bookease.com with your domain)
# ═══════════════════════════════════════════
FRONTEND_URL=https://bookease.com

# ═══════════════════════════════════════════
# SSLCOMMERZ PAYMENTS (uncomment when ready)
# ═══════════════════════════════════════════
# SSLCOMMERZ_STORE_ID=your_store_id
# SSLCOMMERZ_STORE_PASSWORD=your_store_password
# SSLCOMMERZ_IS_SANDBOX=false
```

Save: `Ctrl+X` → `Y` → `Enter`

**Generate the random strings:**

```bash
# JWT_SECRET (64 chars)
openssl rand -hex 32

# ENCRYPTION_KEY (32 chars)
openssl rand -hex 16
```

Copy each output and paste into the `.env` file.

**Run database migrations and build:**

```bash
npx prisma generate
npx prisma migrate deploy
npm run build
```

**Create uploads directory:**

```bash
mkdir -p /var/www/bookease/backend/uploads
```

### 3.3 Set Up Frontend

```bash
cd /var/www/bookease/frontend
npm install
```

Create environment file:

```bash
nano .env.production
```

Paste (replace domain):

```env
NEXT_PUBLIC_API_URL=https://api.bookease.com/api
```

Save and build:

```bash
npm run build
```

> This takes 1-3 minutes. If it fails with memory error, the swap from Step 2.7 should prevent this. If it still fails:
> ```bash
> NODE_OPTIONS="--max-old-space-size=2048" npm run build
> ```

---

## PART 4 — NGINX CONFIGURATION

### 4.1 Remove Default Config

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### 4.2 Create BookEase Config

```bash
sudo nano /etc/nginx/sites-available/bookease
```

Paste the following — **replace `bookease.com` with your domain** (5 places):

```nginx
# ─────────────────────────────────────────────
# Backend API — api.bookease.com
# ─────────────────────────────────────────────
server {
    listen 80;
    server_name api.bookease.com;

    # Allow image uploads up to 10MB
    client_max_body_size 10M;

    # Serve uploaded images directly (fast, cached)
    location /uploads/ {
        alias /var/www/bookease/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxy everything else to Express
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        # Timeouts for payment webhooks
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# ─────────────────────────────────────────────
# Frontend — bookease.com + *.bookease.com
# ─────────────────────────────────────────────
server {
    listen 80;
    server_name bookease.com *.bookease.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save: `Ctrl+X` → `Y` → `Enter`

### 4.3 Enable and Test

```bash
sudo ln -s /etc/nginx/sites-available/bookease /etc/nginx/sites-enabled/

# Test config for syntax errors
sudo nginx -t

# If "test is successful", reload
sudo systemctl reload nginx
```

---

## PART 5 — SSL CERTIFICATES (HTTPS)

### 5.1 SSL for API Subdomain

```bash
sudo certbot --nginx -d api.bookease.com
```

Enter your email, agree to terms.
Certbot will auto-configure Nginx for HTTPS.

### 5.2 Wildcard SSL for Frontend

Wildcard certificates require DNS verification. Choose based on your DNS provider:

#### Method A — Cloudflare DNS (Recommended)

If your domain uses Cloudflare DNS:

```bash
# Install Cloudflare plugin
sudo apt install -y python3-certbot-dns-cloudflare
```

Create credentials file:
```bash
sudo nano /etc/letsencrypt/cloudflare.ini
```

Paste:
```ini
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN
```

> **Get your token:** https://dash.cloudflare.com/profile/api-tokens
> Click "Create Token" → "Edit zone DNS" template → Select your domain zone → Create

```bash
sudo chmod 600 /etc/letsencrypt/cloudflare.ini

sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d bookease.com \
  -d "*.bookease.com"
```

#### Method B — Manual DNS (Any Registrar)

```bash
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d bookease.com \
  -d "*.bookease.com"
```

Certbot will say:
```
Please deploy a DNS TXT record:
_acme-challenge.bookease.com with value: xYz123AbC...
```

1. Go to your registrar's DNS settings
2. Add a **TXT** record:
   - **Name:** `_acme-challenge`
   - **Value:** the value certbot gave you
3. Wait 1-2 minutes
4. Press **Enter** in the terminal

It may ask for a second TXT value — add it with the same name (you'll have 2 TXT records).

### 5.3 Update Nginx for HTTPS

```bash
sudo nano /etc/nginx/sites-available/bookease
```

**Replace the entire frontend section** with:

```nginx
# ─────────────────────────────────────────────
# Frontend — HTTP → HTTPS redirect
# ─────────────────────────────────────────────
server {
    listen 80;
    server_name bookease.com *.bookease.com;
    return 301 https://$host$request_uri;
}

# ─────────────────────────────────────────────
# Frontend — HTTPS with wildcard SSL
# ─────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name bookease.com *.bookease.com;

    ssl_certificate /etc/letsencrypt/live/bookease.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bookease.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5.4 Verify Auto-Renewal

```bash
sudo certbot renew --dry-run
```

Should say "Congratulations, all renewals succeeded."

Certbot auto-renews via a systemd timer — check it's active:
```bash
sudo systemctl status certbot.timer
```

---

## PART 6 — START EVERYTHING WITH PM2

PM2 keeps your apps running 24/7 and auto-restarts on crash or server reboot.

### 6.1 Start Backend

```bash
cd /var/www/bookease/backend
pm2 start npm --name "backend" -- start
```

### 6.2 Start Frontend

```bash
cd /var/www/bookease/frontend
pm2 start npm --name "frontend" -- start
```

### 6.3 Verify Both Are Running

```bash
pm2 status
```

Output:
```
┌─────┬──────────┬─────────┬──────┬────────┬─────────┐
│ id  │ name     │ mode    │ pid  │ status │ restart  │
├─────┼──────────┼─────────┼──────┼────────┼─────────┤
│ 0   │ backend  │ fork    │ 1234 │ online │ 0        │
│ 1   │ frontend │ fork    │ 1235 │ online │ 0        │
└─────┴──────────┴─────────┴──────┴────────┴─────────┘
```

Both should show **online**.

### 6.4 Save and Enable Auto-Start

```bash
# Save current process list
pm2 save

# Generate startup script (run on boot)
pm2 startup
```

PM2 will print a command like:
```
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

**Copy and run that exact command.**

### 6.5 Useful PM2 Commands

```bash
pm2 status                 # See all processes
pm2 logs                   # See all logs (live)
pm2 logs backend           # Backend logs only
pm2 logs frontend          # Frontend logs only
pm2 logs backend --lines 100  # Last 100 lines

pm2 restart all            # Restart everything
pm2 restart backend        # Restart backend only
pm2 restart frontend       # Restart frontend only

pm2 monit                  # Live CPU/RAM dashboard
pm2 flush                  # Clear all log files
```

---

## PART 7 — VERIFY EVERYTHING

### 7.1 Test the Landing Page

Open browser → `https://bookease.com`

You should see the BookEase landing page with the padlock (HTTPS) icon.

### 7.2 Test Login / Register

- `https://bookease.com/login`
- `https://bookease.com/register`

### 7.3 Test the API

```bash
curl https://api.bookease.com/api/health
```

Or open `https://api.bookease.com/api/health` in browser.

### 7.4 Test Wildcard Subdomains

1. Register at `https://bookease.com/register`
2. Complete onboarding → choose a subdomain (e.g., `myclinic`)
3. Open `https://myclinic.bookease.com`
4. Should show the tenant booking page

### 7.5 Test Image Uploads

1. Go to Dashboard → My Page
2. Upload a logo or banner image
3. Verify it appears (stored at `/var/www/bookease/backend/uploads/`)

### 7.6 Test SSL

Go to: `https://www.ssllabs.com/ssltest/analyze.html?d=bookease.com`

Should show grade **A** or **A+**.

---

## PART 8 — AUTO-DEPLOY SCRIPT

When you push code to GitHub, SSH in and run one command to update.

### 8.1 Create the Script

```bash
nano /var/www/bookease/deploy.sh
```

Paste:

```bash
#!/bin/bash
set -e

echo ""
echo "==============================="
echo "  BookEase Deploy"
echo "  $(date)"
echo "==============================="
echo ""

cd /var/www/bookease

echo "[1/6] Pulling latest code..."
git pull origin main

echo "[2/6] Installing backend dependencies..."
cd backend
npm install --production

echo "[3/6] Running database migrations..."
npx prisma generate
npx prisma migrate deploy

echo "[4/6] Building backend..."
npm run build

echo "[5/6] Building frontend..."
cd ../frontend
npm install --production
npm run build

echo "[6/6] Restarting services..."
pm2 restart all

echo ""
echo "==============================="
echo "  Deploy complete!"
echo "==============================="
pm2 status
```

```bash
chmod +x /var/www/bookease/deploy.sh
```

### 8.2 Usage

```bash
ssh deploy@65.109.123.45
/var/www/bookease/deploy.sh
```

That's it — pulls code, builds, migrates, restarts.

---

## PART 9 — BACKUPS

Your database is on Neon (auto-backed up). But let's also back up uploads.

### 9.1 Daily Upload Backup (to a separate location)

```bash
sudo mkdir -p /var/backups/bookease
```

Create backup script:

```bash
nano /var/www/bookease/backup.sh
```

Paste:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/bookease"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C /var/www/bookease/backend uploads/

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup complete: uploads_$TIMESTAMP.tar.gz"
```

```bash
chmod +x /var/www/bookease/backup.sh
```

### 9.2 Schedule Daily Backup (3 AM)

```bash
crontab -e
```

Add this line at the bottom:

```
0 3 * * * /var/www/bookease/backup.sh >> /var/log/bookease-backup.log 2>&1
```

Save and exit.

### 9.3 Neon Database Backups

Neon handles this automatically:
- **Point-in-time recovery** — restore to any second in the last 7 days
- **No setup needed** — it's built in

To manually export if needed:
```bash
pg_dump "YOUR_NEON_DATABASE_URL" > /var/backups/bookease/db_$(date +%Y%m%d).sql
```

---

## PART 10 — SECURITY HARDENING

### 10.1 Disable Root SSH Login

```bash
sudo nano /etc/ssh/sshd_config
```

Find and change these lines:

```
PermitRootLogin no
PasswordAuthentication no
```

```bash
sudo systemctl restart sshd
```

> **WARNING:** Make sure you can SSH as `deploy` user first before doing this!

### 10.2 Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

Select **"Yes"** when prompted.

### 10.3 Set Up Monitoring (Free)

**UptimeRobot** — alerts you if the site goes down:

1. Go to https://uptimerobot.com (free account)
2. Add monitors:
   - `https://bookease.com` (main site)
   - `https://api.bookease.com/api/health` (API)
3. Set alert contacts (email, Telegram, etc.)

### 10.4 Fail2Ban (Block Brute Force Attacks)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## TROUBLESHOOTING

### Site shows "502 Bad Gateway"

App isn't running or crashed:

```bash
pm2 status
# If offline:
pm2 restart all
pm2 logs --lines 50
```

### Site shows "Connection Refused"

Nginx isn't running:

```bash
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Backend can't connect to database

```bash
cd /var/www/bookease/backend
npx prisma db pull
```

If this fails, check your `DATABASE_URL` in `.env`.
Make sure the Neon project is active (free tier pauses after 5 min idle, wakes on connection).

### Frontend build fails (out of memory)

```bash
# Check memory
free -h

# Build with limited memory
cd /var/www/bookease/frontend
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### SSL certificate won't renew

```bash
# Check status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# If wildcard renewal fails (manual DNS method), you need to re-do Step 5.2
```

### Uploads not showing

Check Nginx is serving the uploads directory:

```bash
# Check files exist
ls -la /var/www/bookease/backend/uploads/

# Check Nginx config has the /uploads/ location block
sudo nginx -t

# Check permissions
sudo chown -R deploy:deploy /var/www/bookease/backend/uploads/
```

### Subdomain not working

1. Check DNS: `ping myclinic.bookease.com` → should resolve to your VPS IP
2. Check Nginx wildcard: `server_name bookease.com *.bookease.com;`
3. Check frontend subdomain parsing in `src/app/page.tsx`

### Check what's using disk space

```bash
df -h           # Overall disk usage
du -sh /var/www/bookease/backend/uploads/   # Upload folder size
du -sh /var/www/bookease/frontend/.next/    # Frontend build size
```

### View real-time logs

```bash
# All apps
pm2 logs

# Backend only
pm2 logs backend

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

---

## QUICK REFERENCE

### SSH into server
```bash
ssh deploy@YOUR_VPS_IP
```

### Deploy updates
```bash
/var/www/bookease/deploy.sh
```

### Restart apps
```bash
pm2 restart all
```

### View logs
```bash
pm2 logs
```

### Check status
```bash
pm2 status
sudo systemctl status nginx
```

### Renew SSL
```bash
sudo certbot renew
```

---

## FILE LOCATIONS

```
/var/www/bookease/
├── backend/
│   ├── .env                  ← Backend environment variables
│   ├── uploads/              ← Uploaded images (logos, banners, gallery)
│   ├── dist/                 ← Compiled backend
│   └── prisma/               ← Database schema
├── frontend/
│   ├── .env.production       ← Frontend environment variables
│   └── .next/                ← Compiled frontend
├── deploy.sh                 ← One-command deploy script
└── backup.sh                 ← Upload backup script

/etc/nginx/sites-available/bookease    ← Nginx config
/etc/letsencrypt/live/bookease.com/    ← SSL certificates
/var/backups/bookease/                 ← Upload backups
```

---

## COST SUMMARY

| Item                | Cost            | Backed up?         |
|---------------------|-----------------|--------------------|
| Hetzner VPS CX22    | €4.35/month     | —                  |
| Neon PostgreSQL     | Free forever    | Auto (7-day PITR)  |
| Images (VPS disk)   | Free (on VPS)   | Daily script       |
| SSL (Let's Encrypt) | Free            | Auto-renew         |
| Domain              | ~$10/year       | —                  |
| **Total**           | **~$5/month**   |                    |
