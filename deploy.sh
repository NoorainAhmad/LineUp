#!/bin/bash

echo "🚀 Starting deployment..."

# Load NVM
export NVM_DIR=~/.nvm
source ~/.nvm/nvm.sh

cd /home/ubuntu/lineup_v1

echo "📦 Pulling latest changes..."
git pull origin master

echo "🔧 Working on server..."
cd server

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️  Running migrations..."
npx prisma migrate deploy

echo "🏗️  Building application..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart ecosystem.config.cjs || pm2 start lineup-server
pm2 save

echo "🗑️ Cleaning up..."
rm -rf node_modules

echo "🔧 Working on client..."
cd ../client

echo "📦 Installing dependencies..."
npm ci

echo "🏗️  Building application..."
npm run build

echo "🗑️ Cleaning up..."
rm -rf node_modules

echo "🔧 Working on nginx..."
sudo rm -rf /var/www/lineup &&
sudo mkdir -p /var/www/lineup && 
sudo cp -r dist/* /var/www/lineup &&
sudo chown -R www-data:www-data /var/www/lineup

echo "✅ Deployment complete!"