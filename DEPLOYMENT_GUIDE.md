# TalonForge Deployment Guide for Coolify

This guide will walk you through deploying TalonForge to your local Coolify instance.

---

## Option 1: Quick Local Deployment with Docker Compose (Recommended for Review)

This is the fastest way to get TalonForge running locally for review.

### Step 1: Start the Application

```bash
cd /home/dad/Documents/talononebuild
docker-compose up -d --build
```

### Step 2: Wait for Services to Start

```bash
# Check service status
docker-compose ps

# Follow logs
docker-compose logs -f
```

### Step 3: Run Database Migrations

```bash
# Run Prisma migrations
docker exec talonforge-backend npx prisma migrate deploy

# Seed the database with default admin user
docker exec talonforge-backend npx prisma db seed
```

### Step 4: Access TalonForge

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

**Default Login:**
- Email: `admin@talonforge.io`
- Password: `admin123`

### Stopping the Application

```bash
docker-compose down

# To remove volumes as well
docker-compose down -v
```

---

## Option 2: Deploy to Coolify (For Production)

### Prerequisites

- Coolify running on http://localhost:8000
- Git repository set up (already done ✅)

### Step 1: Push to Git Repository

If you have a remote Git repository:

```bash
# Add remote
git remote add origin <your-git-url>

# Push
git push -u origin master
```

Or use Coolify's local Git option.

### Step 2: Create a New Service in Coolify

1. Open Coolify at http://localhost:8000
2. Navigate to your project or create a new one
3. Click **"Add Resource"** → **"Service"**
4. Choose **"Docker Compose"** as the deployment method

### Step 3: Configure the Service

**General Settings:**
- **Name**: talonforge
- **Git Repository**: Point to this repository
- **Branch**: master
- **Docker Compose File**: `docker-compose.yml` (root of repo)

**Environment Variables:**
Add these variables in Coolify's environment section:

```bash
DATABASE_URL=postgresql://user:pass@tf-db:5432/talonforge
ENCRYPTION_KEY=<copy from .env file>
JWT_SECRET=<copy from .env file>
NODE_ENV=production
PORT=3000
POSTGRES_DB=talonforge
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
```

### Step 4: Add PostgreSQL Database (Optional - Using Coolify Managed DB)

If you want to use Coolify's managed PostgreSQL instead of the internal one:

1. In Coolify, go to **"Add Resource"** → **"Database"** → **"PostgreSQL"**
2. Create the database
3. Copy the `DATABASE_URL` from Coolify
4. Update the environment variable in your service
5. In `docker-compose.yml`, comment out the `tf-db` service and `depends_on: tf-db`

### Step 5: Deploy

1. Click **"Deploy"** in Coolify
2. Monitor the build logs
3. Wait for deployment to complete

### Step 6: Run Post-Deployment Commands

Once deployed, run these commands:

```bash
# Get the container name from Coolify or docker ps
docker exec <backend-container-name> npx prisma migrate deploy
docker exec <backend-container-name> npx prisma db seed
```

Or use Coolify's "Execute Command" feature:
- Container: `talonforge-backend`
- Command: `npx prisma migrate deploy && npx prisma db seed`

### Step 7: Access Your Application

Coolify will provide you with the application URL (usually a subdomain or custom domain you configured).

---

## Troubleshooting

### Check Container Logs

```bash
# Docker Compose
docker-compose logs backend
docker-compose logs frontend
docker-compose logs tf-db

# Or in Coolify UI
# Navigate to your service → Logs
```

### Database Connection Issues

If the backend can't connect to the database:

1. Check the `DATABASE_URL` format is correct
2. Ensure the database container is running: `docker ps`
3. Check network connectivity: `docker network ls`
4. Verify credentials match between `DATABASE_URL` and PostgreSQL env vars

### Frontend Can't Reach Backend

If you see API errors in the browser:

1. Check the backend is running: `curl http://localhost:3000/health`
2. Update `VITE_API_BASE_URL` in client/.env to point to your backend URL
3. Rebuild the frontend: `docker-compose up -d --build tf-frontend`

### Prisma Migration Errors

If migrations fail:

```bash
# Reset the database (WARNING: Deletes all data)
docker exec talonforge-backend npx prisma migrate reset

# Or manually create the database
docker exec talonforge-db psql -U user -c "CREATE DATABASE talonforge;"
```

### Port Conflicts

If ports 80 or 3000 are already in use:

1. Edit `docker-compose.yml`
2. Change the port mappings:
   ```yaml
   ports:
     - "8080:80"  # Frontend

   ports:
     - "3001:3000"  # Backend
   ```
3. Update `VITE_API_BASE_URL` in client/.env accordingly

---

## Post-Deployment Configuration

### Change Default Password

1. Login with default credentials
2. Navigate to Settings
3. Update admin password

### Configure AI Provider (Optional)

1. Navigate to Settings → AI Configuration
2. Add your OpenAI/Gemini/Claude API keys
3. Configure model preferences

### Add Your First Instance

1. Navigate to Instance Manager
2. Click "Add Instance"
3. Fill in details:
   - **Name**: Your instance name
   - **Type**: talon or contentful
   - **Region**: Your instance region
   - **URL**: API endpoint URL
   - **API Key**: Your API key
4. Click "Test Connection" to verify
5. Save

---

## Monitoring

### Health Check Endpoints

- Backend: `http://your-domain:3000/health`
- Returns: `{"success": true, "data": {"status": "healthy", "version": "3.0"}}`

### Application Logs

Location in container: `/app/logs/`
- `app.log` - General application logs
- `error.log` - Error logs only

View logs:
```bash
docker exec talonforge-backend tail -f logs/app.log
```

Or in Coolify:
- Navigate to service → Logs → Select container

---

## Backup & Maintenance

### Database Backup

```bash
# Backup
docker exec talonforge-db pg_dump -U user talonforge > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker exec -i talonforge-db psql -U user talonforge
```

### Application Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Run new migrations
docker exec talonforge-backend npx prisma migrate deploy
```

---

## Security Recommendations

1. **Change default credentials** immediately after first login
2. **Use HTTPS** in production (configure reverse proxy in Coolify)
3. **Rotate secrets** regularly (ENCRYPTION_KEY, JWT_SECRET)
4. **Backup database** regularly
5. **Monitor logs** for suspicious activity
6. **Keep dependencies updated**: `npm update` in both client and server

---

## Support

For issues:
- Check logs first
- Review this deployment guide
- Check `docs/` directory for additional documentation
- Open an issue in the repository

---

**You're all set! 🎉**

TalonForge is now running and ready to manage your Talon.One and Contentful instances.
