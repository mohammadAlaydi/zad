# ZadPay API — EC2 Deployment Guide

Stack: **Ubuntu 24.04 LTS · PostgreSQL 16 · Redis 7 · Node.js 20 · Nginx**

---

## 1. Launch EC2

- AMI: **Ubuntu 24.04 LTS**
- Instance type: `t3.small` or larger
- Security group — open these ports:

| Port | Source    | Purpose       |
| ---- | --------- | ------------- |
| 22   | Your IP   | SSH           |
| 80   | 0.0.0.0/0 | HTTP (Nginx)  |
| 443  | 0.0.0.0/0 | HTTPS (Nginx) |

> Do **not** expose port 3000 publicly — Nginx will proxy it.

---

## 2. Connect & Update

```bash
ssh -i your-key.pem ubuntu@<EC2-IP>
sudo apt update && sudo apt upgrade -y
```

---

## 3. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should print v20.x.x
```

Install pnpm:

```bash
sudo npm install -g pnpm
```

---

## 4. Install PostgreSQL 16

```bash
sudo apt install -y postgresql-16 postgresql-client-16
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

Create the database and user:

```bash
sudo -u postgres psql
```

Inside psql:

```sql
CREATE DATABASE zadpay;
CREATE USER zadpay_user WITH PASSWORD 'zadpay@123';
GRANT ALL PRIVILEGES ON DATABASE zadpay TO zadpay_user;
\c zadpay
GRANT ALL ON SCHEMA public TO zadpay_user;
\q
```

---

## 5. Install Redis 7

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

Verify it's running:

```bash
redis-cli ping   # should return PONG
```

---

## 6. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 7. Install PM2 (process manager)

```bash
sudo npm install -g pm2
```

---

## 8. Clone the Repo

```bash
cd /srv
sudo mkdir zadpay && sudo chown ubuntu:ubuntu zadpay
git clone https://github.com/your-org/zadpay.git zadpay
cd zadpay
pnpm install
```

---

## 9. Configure Environment

```bash
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

Set these values:

```env
NODE_ENV=production
PORT=3000
HOST=127.0.0.1

DATABASE_URL=postgresql://zadpay_user:choose-a-strong-password@localhost:5432/zadpay?schema=public
REDIS_URL=redis://localhost:6379

LOG_LEVEL=info
CORS_ORIGINS=https://your-domain.com

# Generate in step 10 below
JWT_SIGNING_KEY=
JWT_VERIFY_KEY=
REFRESH_TOKEN_PEPPER=

ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=604800

SENTRY_DSN=https://...   # required in production
```

---

## 10. Generate JWT Keys

```bash
cd /srv/zadpay
pnpm --filter @zadpay/api run keygen
```

Copy the printed `JWT_SIGNING_KEY` and `JWT_VERIFY_KEY` values into `apps/api/.env`.

For `REFRESH_TOKEN_PEPPER`, generate a random 32-character secret:

```bash
openssl rand -hex 32
```

Paste the output as the value of `REFRESH_TOKEN_PEPPER` in `.env`.

---

## 11. Run Database Migrations

```bash
pnpm --filter @zadpay/api run prisma:deploy
```

---

## 12. Start with PM2

```bash
cd /srv/zadpay/apps/api
pm2 start npx --name zadpay-api -- tsx src/server.ts
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot
```

Check logs:

```bash
pm2 logs zadpay-api
```

---

## 14. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/zadpay
```

Paste:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/zadpay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 15. Add HTTPS with Let's Encrypt (recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot will update the Nginx config automatically and set up auto-renewal.

---

## 16. Verify

```bash
curl https://your-domain.com/health
# should return {"status":"ok"}
```

---

## Updating the App

```bash
cd /srv/zadpay
git pull
pnpm install
pnpm --filter @zadpay/api run prisma:deploy
pm2 restart zadpay-api
```

---

## CI/CD with Bitbucket Pipelines

Every push to `main` automatically tests and deploys to EC2.

---

### 1. Generate a Deploy SSH Key

On your **local machine**:

```bash
ssh-keygen -t ed25519 -f bitbucket_deploy_key -N ""
```

This creates two files:

- `bitbucket_deploy_key` — private key (goes into Bitbucket)
- `bitbucket_deploy_key.pub` — public key (goes onto EC2)

---

### 2. Add the Public Key to EC2

```bash
ssh -i your-key.pem ubuntu@<EC2-IP>
echo "PASTE_CONTENT_OF_bitbucket_deploy_key.pub" >> ~/.ssh/authorized_keys
```

---

### 3. Add Variables to Bitbucket

Go to **Repository → Settings → Repository variables** and add:

| Variable          | Value                                           |
| ----------------- | ----------------------------------------------- |
| `SSH_PRIVATE_KEY` | content of `bitbucket_deploy_key` (private key) |
| `EC2_HOST`        | your EC2 public IP (e.g. `13.61.34.102`)        |
| `EC2_USER`        | `ubuntu`                                        |

---

### 4. Make the Deploy Script Executable on EC2

```bash
chmod +x /home/ubuntu/zadpay/scripts/deploy.sh
```

---

### 5. Push to Trigger the Pipeline

```bash
git add bitbucket-pipelines.yml scripts/deploy.sh
git commit -m "chore: add Bitbucket CI/CD pipeline"
git push origin main
```

Go to **Bitbucket → Pipelines** to watch it run.

---

### Pipeline Behaviour

| Event          | What runs                         |
| -------------- | --------------------------------- |
| Pull request   | Tests + typecheck only            |
| Push to `main` | Tests + typecheck → deploy to EC2 |

The deploy step SSHes into EC2 and runs `scripts/deploy.sh` which:

1. `git pull` latest code
2. `pnpm install`
3. `prisma migrate deploy`
4. `pm2 restart zadpay-api`

---

## Quick Reference

| Command                                        | Purpose               |
| ---------------------------------------------- | --------------------- |
| `pm2 logs zadpay-api`                          | View app logs         |
| `pm2 restart zadpay-api`                       | Restart the server    |
| `sudo systemctl status postgresql`             | Check Postgres status |
| `sudo systemctl status redis-server`           | Check Redis status    |
| `sudo nginx -t && sudo systemctl reload nginx` | Reload Nginx config   |
| `pnpm --filter @zadpay/api run prisma:studio`  | Browse the database   |
