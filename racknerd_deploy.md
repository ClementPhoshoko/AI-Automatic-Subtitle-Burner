# RackNerd Deployment Guide

**Domain:** `burner.akovolabs.co.za`

> **Note:** Docker support is planned but not yet built. These instructions cover manual deployment.

## Prerequisites

- RackNerd VPS with Ubuntu 22.04+
- 1GB RAM minimum (2GB recommended)
- DNS A record: `burner.akovolabs.co.za` pointing to your VPS IP
- Node.js 20+ installed via [nvm](https://github.com/nvm-sh/nvm)
- FFmpeg installed on the VPS
- PM2 for process management

## 1. Server Setup

```bash
# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22

# Install FFmpeg
sudo apt update && sudo apt install ffmpeg -y

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

## 2. Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/subtitle-burner
sudo chown -R $USER:$USER /var/www/subtitle-burner

# Clone the repo
git clone https://github.com/your-org/ai-subtitle-burner.git /var/www/subtitle-burner

# Install server dependencies
cd /var/www/subtitle-burner/server
npm install --production

# Create .env file
cp .env.example .env
nano .env
```

## 3. Environment Variables

```env
PORT=3001

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

MAX_FILE_SIZE_MB=150
WORKER_ENABLED=true
FFMPEG_PATH=ffmpeg
GEMINI_MODEL=gemini-3.5-flash
NODE_ENV=production
```

## 4. Start with PM2

```bash
cd /var/www/subtitle-burner/server
pm2 start app.js --name subtitle-burner
pm2 save
pm2 startup
```

## 5. Build Client

```bash
cd /var/www/subtitle-burner/client
npm install
npm run build
```

## 6. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/burner.akovolabs.co.za`:

```nginx
server {
    listen 80;
    server_name burner.akovolabs.co.za;

    client_max_body_size 200M;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Swagger docs
    location /api-docs/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check
    location /api/health {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Serve React frontend
    location / {
        root /var/www/subtitle-burner/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/burner.akovolabs.co.za /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

## 7. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d burner.akovolabs.co.za
```

This auto-updates the Nginx config with SSL. Certbot also sets up auto-renewal.

## 8. Monitoring

```bash
pm2 logs subtitle-burner
pm2 monit
```

Logs are JSON-formatted in production. Parse with:

```bash
pm2 logs subtitle-burner --json
```

## 9. GitHub Actions CI/CD (Future Setup)

Create `.github/workflows/deploy.yml` in the repo root:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Build client
        run: |
          cd client
          npm ci
          npm run build

      - name: Deploy to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "server/,client/dist/,package.json"
          target: "/var/www/subtitle-burner"

      - name: Restart app
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/subtitle-burner/server
            npm install --production
            pm2 restart subtitle-burner
```

**Secrets to add on GitHub:**
- `VPS_HOST` — your VPS IP
- `VPS_USER` — SSH username (e.g. `root`)
- `VPS_SSH_KEY` — your private SSH key

## Future — Docker Deployment

A `Dockerfile` and `docker-compose.yml` will be added in a future release to simplify deployment with a single `docker compose up -d` command.

## Troubleshooting

- **Worker not picking up jobs:** Check `WORKER_ENABLED=true` in `.env`
- **FFmpeg errors:** Run `ffmpeg -version` to confirm installation
- **Gemini quota:** Check usage at https://ai.google.dev/
- **Upload fails:** Check `MAX_FILE_SIZE_MB` and Supabase storage bucket limits (free tier: 50MB per file)
- **Nginx 502:** Ensure PM2 is running: `pm2 list`
- **Domain not resolving:** Verify DNS A record for `burner.akovolabs.co.za`
