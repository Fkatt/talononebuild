#!/bin/bash

# Fixed deployment script - uses port 8080 instead of 80

echo "🚀 Deploying TalonForge on port 8080..."
echo ""

cd /home/dad/Documents/talononebuild

# Stop existing containers
echo "Stopping existing containers..."
sudo docker compose down

# Build and start
echo ""
echo "Building and starting (this takes 3-5 minutes)..."
sudo docker compose up -d --build

# Wait for services
echo ""
echo "Waiting for services to start (30 seconds)..."
sleep 30

# Setup database
echo ""
echo "Setting up database..."
sudo docker exec talonforge-backend npx prisma migrate deploy
sudo docker exec talonforge-backend npx prisma db seed

# Show status
echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "🌐 Access TalonForge at:"
echo "   http://10.0.0.1:8080"
echo ""
echo "🔐 Login with:"
echo "   Email: admin@talonforge.io"
echo "   Password: admin123"
echo ""
echo "📊 Container Status:"
sudo docker compose ps
echo ""
echo "=========================================="
