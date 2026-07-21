# RackNerd Deployment Guide

> **Note:** Docker support is planned but not yet built. These instructions cover manual deployment.

## Prerequisites

- RackNerd VPS with Ubuntu 22.04+
- 1GB RAM minimum (2GB recommended)
- Domain pointed to your VPS IP
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
# Clone the repo
git clone https://github.com/your-org/ai-subtitle-burner.git /opt/subtitle-burner
cd /opt/subtitle-burner/server

# Install dependencies
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
cd /opt/subtitle-burner/server
pm2 start app.js --name subtitle-burner
pm2 save
pm2 startup
```

## 5. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/subtitle-burner`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 200M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/subtitle-burner /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## 6. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 7. Client Build

```bash
cd /opt/subtitle-burner/client
npm install
npm run build
```

Serve the `dist/` folder via Nginx or configure the Express server to serve it.

## 8. Monitoring

```bash
pm2 logs subtitle-burner
pm2 monit
```

## Future — Docker Deployment

A `Dockerfile` and `docker-compose.yml` will be added in a future release to simplify deployment with a single `docker compose up -d` command.

## Troubleshooting

- **Worker not picking up jobs:** Check `WORKER_ENABLED=true` in `.env`
- **FFmpeg errors:** Run `ffmpeg -version` to confirm installation
- **Gemini quota:** Check usage at https://ai.google.dev/
- **Upload fails:** Check `MAX_FILE_SIZE_MB` and Supabase storage bucket limits (free tier: 50MB per file)
