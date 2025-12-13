#!/bin/bash

# Helper script to display environment variables for Coolify
# Copy these into Coolify's Environment Variables section

echo "=========================================="
echo "TalonForge Environment Variables"
echo "Copy these into Coolify's Environment tab"
echo "=========================================="
echo ""

if [ -f .env ]; then
    echo "📋 Copy and paste these into Coolify:"
    echo ""
    echo "# Database URL (update with your Coolify DB URL)"
    cat .env | grep DATABASE_URL
    echo ""
    echo "# Security Keys"
    cat .env | grep ENCRYPTION_KEY
    cat .env | grep JWT_SECRET
    echo ""
    echo "# Server Configuration"
    cat .env | grep PORT
    cat .env | grep NODE_ENV
    echo ""
else
    echo "❌ .env file not found!"
    echo "Run ./scripts/setup-coolify.sh first to generate environment variables"
fi

echo "=========================================="
echo ""
echo "💡 Tips:"
echo "1. Update DATABASE_URL with your Coolify PostgreSQL URL"
echo "2. Keep ENCRYPTION_KEY and JWT_SECRET secret!"
echo "3. After adding to Coolify, deploy your application"
echo ""
