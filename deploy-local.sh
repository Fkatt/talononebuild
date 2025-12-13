#!/bin/bash

# TalonForge Local Deployment Script
# Deploys TalonForge using Docker Compose for local review

set -e

echo "=================================="
echo "TalonForge Local Deployment"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! sudo docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running or you don't have permissions${NC}"
    echo ""
    echo "To fix Docker permissions, run:"
    echo "  sudo usermod -aG docker \$USER"
    echo "  newgrp docker"
    echo ""
    echo "Or run this script with sudo:"
    echo "  sudo ./deploy-local.sh"
    exit 1
fi

echo -e "${YELLOW}📦 Building Docker images...${NC}"
echo "This may take 3-5 minutes..."
echo ""

# Build and start services
sudo docker compose up -d --build

echo ""
echo -e "${GREEN}✅ Docker containers started!${NC}"
echo ""

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Check if containers are running
echo ""
echo -e "${YELLOW}📊 Container Status:${NC}"
sudo docker compose ps

echo ""
echo -e "${YELLOW}🔄 Running database migrations...${NC}"

# Run Prisma migrations
sudo docker exec talonforge-backend npx prisma migrate deploy

echo ""
echo -e "${YELLOW}🌱 Seeding database...${NC}"

# Seed database
sudo docker exec talonforge-backend npx prisma db seed

echo ""
echo "=================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "🌐 Access TalonForge:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "🔐 Default Login:"
echo "   Email: admin@talonforge.io"
echo "   Password: admin123"
echo ""
echo "📝 View Logs:"
echo "   sudo docker compose logs -f"
echo ""
echo "🛑 Stop Services:"
echo "   sudo docker compose down"
echo ""
echo "=================================="
