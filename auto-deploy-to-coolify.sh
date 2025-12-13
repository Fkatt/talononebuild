#!/bin/bash

# Automated TalonForge Deployment Script for Coolify
# This will deploy TalonForge and make it accessible via Coolify

set -e

echo "=========================================="
echo "🚀 Automated TalonForge Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /home/dad/Documents/talononebuild

# Step 1: Stop any existing deployment
echo -e "${YELLOW}🛑 Stopping any existing deployment...${NC}"
sudo docker compose down 2>/dev/null || true

# Step 2: Pull latest changes if needed
echo -e "${YELLOW}📦 Preparing deployment...${NC}"
git add -A 2>/dev/null || true
git commit -m "Pre-deployment commit" 2>/dev/null || true

# Step 3: Build and deploy
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
echo "This will take about 3-5 minutes..."
echo ""

sudo docker compose build --no-cache

echo ""
echo -e "${YELLOW}🚀 Starting services...${NC}"
sudo docker compose up -d

# Step 4: Wait for services
echo ""
echo -e "${YELLOW}⏳ Waiting for services to start (30 seconds)...${NC}"
sleep 30

# Step 5: Check status
echo ""
echo -e "${YELLOW}📊 Checking container status...${NC}"
sudo docker compose ps

# Step 6: Setup database
echo ""
echo -e "${YELLOW}🗄️  Setting up database...${NC}"

# Wait a bit more for database to be fully ready
sleep 10

echo "Running migrations..."
sudo docker exec talonforge-backend npx prisma migrate deploy

echo ""
echo "Seeding database..."
sudo docker exec talonforge-backend npx prisma db seed

# Step 7: Get access information
echo ""
echo "=========================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "🌐 Access TalonForge at:"
echo "   Frontend: http://10.0.0.1:8080"
echo ""
echo "   Backend API: http://10.0.0.1:3000"
echo "   Health Check: http://10.0.0.1:3000/health"
echo ""
echo "🔐 Login Credentials:"
echo "   Email: admin@talonforge.io"
echo "   Password: admin123"
echo ""
echo "📊 Container Status:"
sudo docker compose ps
echo ""
echo "📝 View Logs:"
echo "   sudo docker compose logs -f"
echo ""
echo "🛑 Stop Services:"
echo "   sudo docker compose down"
echo ""
echo "=========================================="
echo ""
echo -e "${GREEN}TalonForge is now running!${NC}"
echo ""
echo "To import into Coolify:"
echo "1. Go to http://10.0.0.1:8000"
echo "2. Add existing Docker Compose project"
echo "3. Point to: /home/dad/Documents/talononebuild"
echo ""
