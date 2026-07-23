# Deployment Guide (Docker)

## Prerequisites

- RackNerd VPS with Ubuntu 22.04+
- Docker & Docker Compose installed
- Nginx installed (already running for speedtest)
- DNS A record: `burner.akovolabs.co.za` → your VPS IP
- Certbot installed for SSL

---

## 1. Install Docker on VPS

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin -y

docker --version
docker compose version
```

## 2. Clone & Build

```bash
git clone https://github.com/your-org/ai-subtitle-burner.git /var/www/subtitle-burner
cd /var/www/subtitle-burner

# Create .env
cp server/.env.example server/.env
nano server/.env

# Build and start
docker compose up -d --build
```

## 3. Verify

```bash
docker compose logs -f
curl http://localhost:3001/api/health
```

## 4. Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/burner.akovolabs.co.za
sudo ln -s /etc/nginx/sites-available/burner.akovolabs.co.za /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## 5. SSL

```bash
sudo certbot --nginx -d burner.akovolabs.co.za
```

---

## Updating After Code Changes

```bash
cd /var/www/subtitle-burner
git pull
docker compose up -d --build
```

## Common Commands

```bash
docker compose logs -f
docker compose restart
docker compose down
docker ps
```
