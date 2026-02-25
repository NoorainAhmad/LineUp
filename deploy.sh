#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Load NVM
export NVM_DIR=~/.nvm
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
else
    echo -e "${RED}❌ NVM not found${NC}"
    exit 1
fi

# Use Node 18 (or your version)
nvm use 18 || nvm install 18

cd /home/ubuntu/lineup_v1

# Stash any local changes (optional)
echo -e "${YELLOW}📦 Stashing local changes...${NC}"
git stash || true

echo -e "${GREEN}📦 Pulling latest changes...${NC}"
git pull origin master

# Apply stash if any (optional)
git stash pop || true

echo -e "${GREEN}🔧 Working on server...${NC}"
cd server

# Backup .env if exists (optional)
if [ -f .env ]; then
    cp .env .env.backup
fi

echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm ci

echo -e "${GREEN}🔧 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}🗄️  Running migrations...${NC}"
npx prisma migrate deploy

echo -e "${GREEN}🏗️  Building application...${NC}"
npm run build

echo -e "${GREEN}🔄 Restarting PM2...${NC}"
if pm2 list | grep -q "lineup-server"; then
    pm2 reload lineup-server
else
    pm2 start ecosystem.config.cjs
fi
pm2 save

echo -e "${YELLOW}🗑️ Cleaning up server node_modules...${NC}"
rm -rf node_modules

echo -e "${GREEN}🔧 Working on client...${NC}"
cd ../client

# Check if client exists (optional)
if [ ! -d "../client" ]; then
    echo -e "${YELLOW}⚠️  Client directory not found, skipping...${NC}"
else
    echo -e "${GREEN}📦 Installing dependencies...${NC}"
    npm ci

    echo -e "${GREEN}🏗️  Building application...${NC}"
    npm run build

    echo -e "${YELLOW}🗑️ Cleaning up client node_modules...${NC}"
    rm -rf node_modules

    echo -e "${GREEN}🔧 Working on nginx...${NC}"
    # Check if dist directory exists
    if [ ! -d "dist" ]; then
        echo -e "${RED}❌ dist directory not found after build${NC}"
        exit 1
    fi

    sudo rm -rf /var/www/lineup
    sudo mkdir -p /var/www/lineup
    sudo cp -r dist/* /var/www/lineup/
    sudo chown -R www-data:www-data /var/www/lineup

    # Test nginx config before reload
    echo -e "${YELLOW}Testing nginx configuration...${NC}"
    sudo nginx -t && sudo systemctl reload nginx || echo -e "${RED}❌ Nginx config test failed${NC}"
fi

# Restore .env if backup exists (optional)
if [ -f server/.env.backup ]; then
    mv server/.env.backup server/.env
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"

# Show final status
echo -e "${GREEN}📊 Current PM2 status:${NC}"
pm2 list

# Check if app is responding
sleep 3
if curl -s http://localhost:5000/api/v1/health > /dev/null; then
    echo -e "${GREEN}✅ App is responding${NC}"
else
    echo -e "${RED}❌ App is not responding${NC}"
fi