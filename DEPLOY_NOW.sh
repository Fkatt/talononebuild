#!/bin/bash

# Quick Deploy Script - Run this to deploy TalonForge
# Usage: ./DEPLOY_NOW.sh

cd /home/dad/Documents/talononebuild

echo "🚀 Deploying TalonForge..."
echo ""

# Remove version warning from docker-compose.yml
sed -i '/^version:/d' docker-compose.yml

# Build and start services
sudo docker compose up -d --build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check errors above."
    exit 1
fi

echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "🗄️ Running database migrations..."
sudo docker exec talonforge-backend npx prisma migrate deploy

echo ""
echo "🌱 Seeding database with admin user..."
sudo docker exec talonforge-backend npx prisma db seed

echo ""
echo "=================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=================================="
echo ""
echo "🌐 Access TalonForge at: http://localhost"
echo ""
echo "🔐 Login with:"
echo "   Email: admin@talonforge.io"
echo "   Password: admin123"
echo ""
echo "📊 Check status: sudo docker compose ps"
echo "📝 View logs: sudo docker compose logs -f"
echo "🛑 Stop: sudo docker compose down"
echo ""
echo "=================================="
