#!/bin/bash

# TalonForge Coolify Setup Automation Script
# Generates environment variables and prepares for deployment

set -e

echo "==================================="
echo "TalonForge Coolify Setup"
echo "==================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Generate random encryption key (32 bytes = 64 hex characters)
generate_key() {
    openssl rand -hex 32
}

# Generate random JWT secret (64 bytes = 128 hex characters)
generate_secret() {
    openssl rand -hex 64
}

echo "📝 Generating security keys..."
echo ""

ENCRYPTION_KEY=$(generate_key)
JWT_SECRET=$(generate_secret)

echo -e "${GREEN}✅ Keys generated successfully!${NC}"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting without changes."
        exit 0
    fi
fi

# Prompt for DATABASE_URL
echo ""
echo "🗄️  Database Configuration"
echo ""
echo "If you're using Coolify managed PostgreSQL, copy the DATABASE_URL from Coolify UI."
echo "Otherwise, use the default internal database."
echo ""
read -p "Enter DATABASE_URL (or press Enter for internal DB): " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    # Use default internal database URL
    POSTGRES_USER=${POSTGRES_USER:-user}
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-pass}
    POSTGRES_DB=${POSTGRES_DB:-talonforge}
    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@tf-db:5432/${POSTGRES_DB}"
    echo -e "${YELLOW}Using internal database: ${DATABASE_URL}${NC}"
fi

# Create root .env file
cat > .env << EOF
# TalonForge Environment Variables
# Generated on $(date)

# Database
DATABASE_URL=${DATABASE_URL}

# Security Keys (Auto-generated)
ENCRYPTION_KEY=${ENCRYPTION_KEY}
JWT_SECRET=${JWT_SECRET}

# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (for internal DB only)
POSTGRES_DB=${POSTGRES_DB:-talonforge}
POSTGRES_USER=${POSTGRES_USER:-user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-pass}
EOF

echo ""
echo -e "${GREEN}✅ .env file created in project root!${NC}"
echo ""

# Create server/.env file
cat > server/.env << EOF
# TalonForge Server Environment Variables
# Generated on $(date)

PORT=3000
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
JWT_SECRET=${JWT_SECRET}
EOF

echo -e "${GREEN}✅ server/.env file created!${NC}"
echo ""

# Create client/.env file
cat > client/.env << EOF
# TalonForge Client Environment Variables
# Generated on $(date)

VITE_API_BASE_URL=http://localhost:3000
EOF

echo -e "${GREEN}✅ client/.env file created!${NC}"
echo ""

# Display summary
echo "==================================="
echo "✅ Setup Complete!"
echo "==================================="
echo ""
echo "📋 Configuration Summary:"
echo ""
echo "  Database URL: ${DATABASE_URL}"
echo "  Encryption Key: ${ENCRYPTION_KEY:0:16}...${ENCRYPTION_KEY: -4}"
echo "  JWT Secret: ${JWT_SECRET:0:16}...${JWT_SECRET: -4}"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Review the generated .env files"
echo "2. Deploy to Coolify:"
echo "   - Create a new service in Coolify"
echo "   - Connect your Git repository"
echo "   - Add a PostgreSQL resource (if not using internal DB)"
echo "   - Copy the DATABASE_URL from Coolify and re-run this script"
echo "   - Deploy!"
echo ""
echo "3. After deployment, seed the database:"
echo "   docker exec talonforge-backend npx prisma migrate deploy"
echo "   docker exec talonforge-backend npx prisma db seed"
echo ""
echo "4. Access TalonForge at your Coolify domain"
echo "   Default credentials: admin@talonforge.io / admin123"
echo ""
echo "==================================="
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Keep the .env file secure! Do not commit it to Git.${NC}"
echo ""
