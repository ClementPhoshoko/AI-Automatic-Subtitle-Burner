# Deployment Guide (Docker)

## Prerequisites

- RackNerd VPS with Ubuntu 22.04+
- Domain: `burner.akovolabs.co.za` pointing to your VPS IP
- GitHub repo with this code

---

## 1. Install Docker on VPS

SSH into your VPS:

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
```

Fill in your credentials:
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
MAX_FILE_SIZE_MB=50
WORKER_ENABLED=true
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe
NODE_ENV=production
```

Build and start:

```bash
docker compose up -d --build
```

## 3. Verify

```bash
docker compose logs -f
# Should see: "Server started" with port 3001

curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
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

## 6. Auto-Deploy (GitHub Actions)

On push to `main`, GitHub auto-rebuilds the container on your VPS.

### Step 1: Generate SSH key on your local machine

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""
```

This creates:
- `~/.ssh/github_deploy` (private key — goes to GitHub)
- `~/.ssh/github_deploy.pub` (public key — goes to VPS)

### Step 2: Add public key to VPS

```bash
# Copy the public key
cat ~/.ssh/github_deploy.pub
```

SSH into your VPS and add it:

```bash
# On VPS:
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Test SSH connection

```bash
ssh -i ~/.ssh/github_deploy root@your-vps-ip
# Should connect without password prompt
```

### Step 4: Add GitHub Secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Value |
|---|---|
| `VPS_HOST` | Your VPS IP (e.g. `123.45.67.89`) |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Copy the **entire** private key: `cat ~/.ssh/github_deploy` |

> Copy the full output including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`.

### Step 5: Push and verify

```bash
git push origin main
```

Go to your repo → **Actions** tab → you should see the deploy workflow running.

---

## Updating Manually

```bash
cd /var/www/subtitle-burner
git pull
docker compose up -d --build
```

## Common Commands

```bash
docker compose logs -f        # view logs
docker compose restart         # restart container
docker compose down            # stop container
docker ps                      # check status
```
