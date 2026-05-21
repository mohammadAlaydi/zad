#!/bin/sh
set -e

cd /home/ubuntu/zadpay

echo ">>> Pulling latest code..."
git pull origin main

echo ">>> Installing dependencies..."
pnpm install --frozen-lockfile --prefer-offline

echo ">>> Running database migrations..."
cd apps/api
npx prisma migrate deploy || npx prisma migrate resolve --applied "$(ls prisma/migrations | tail -1)"
cd /home/ubuntu/zadpay

echo ">>> Restarting server..."
pm2 describe zadpay-api > /dev/null 2>&1 && pm2 restart zadpay-api --update-env || (cd /home/ubuntu/zadpay/apps/api && pm2 start npx --name zadpay-api -- tsx --env-file=.env src/server.ts)
pm2 save

echo ">>> Done."