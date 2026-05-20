#!/bin/bash
set -e

cd /home/ubuntu/zadpay

echo ">>> Pulling latest code..."
git pull origin main

echo ">>> Installing dependencies..."
pnpm install --frozen-lockfile

echo ">>> Running database migrations..."
cd apps/api
npx prisma migrate deploy
cd /home/ubuntu/zadpay

echo ">>> Restarting server..."
pm2 restart zadpay-api

echo ">>> Done."
