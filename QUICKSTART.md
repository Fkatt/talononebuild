# TalonForge Quick Start

Welcome to TalonForge! Here's how to get it running for review.

---

## 🚀 Fastest Way to Review (Recommended)

Run the automated deployment script:

```bash
cd /home/dad/Documents/talononebuild
./deploy-local.sh
```

This script will:
- ✅ Build all Docker images
- ✅ Start PostgreSQL, Backend, and Frontend
- ✅ Run database migrations
- ✅ Seed with default admin user
- ✅ Show you the access URLs

**Then visit:** http://localhost

**Login with:**
- Email: `admin@talonforge.io`
- Password: `admin123`

---

## 🛠️ Manual Deployment (If Script Doesn't Work)

### Step 1: Build and Start Services

```bash
# Option A: If you're in the docker group
docker compose up -d --build

# Option B: If you need sudo
sudo docker compose up -d --build
```

### Step 2: Wait for Services (about 30 seconds)

```bash
# Check status
sudo docker compose ps

# Watch logs
sudo docker compose logs -f
```

### Step 3: Setup Database

```bash
# Run migrations
sudo docker exec talonforge-backend npx prisma migrate deploy

# Seed database
sudo docker exec talonforge-backend npx prisma db seed
```

### Step 4: Access Application

- Frontend: http://localhost
- Backend: http://localhost:3000
- Health: http://localhost:3000/health

---

## 📱 What You Can Review

### 1. Authentication
- Login page with default credentials
- JWT token-based authentication
- Auto-logout on token expiration

### 2. Dashboard
- Instance count statistics
- System health overview

### 3. Instance Manager
- Add new Talon.One or Contentful instances
- **Test Connection** feature before saving
- View all configured instances
- Edit and delete instances

### 4. UI Features
- Dark mode interface with Tailwind CSS
- Toast notifications for user feedback
- Modal dialogs for forms
- Responsive layout
- Loading states with React Query

### 5. Backend API
- Test with: `curl http://localhost:3000/health`
- API endpoints at `/auth`, `/instances`, `/migrate`, `/backups`, `/ai`, `/admin`
- All responses use standardized format
- JWT authentication on protected routes

---

## 🔍 Testing the Application

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

### Test Login API
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talonforge.io","password":"admin123"}'
```

### View Database
```bash
sudo docker exec -it talonforge-db psql -U user -d talonforge

# Inside psql:
\dt              # List tables
SELECT * FROM users;
SELECT * FROM instances;
\q               # Quit
```

### View Application Logs
```bash
# All services
sudo docker compose logs

# Specific service
sudo docker compose logs backend
sudo docker compose logs frontend

# Follow logs in real-time
sudo docker compose logs -f backend
```

---

## 🛑 Stop & Cleanup

### Stop Services
```bash
sudo docker compose down
```

### Stop and Remove Everything (including database data)
```bash
sudo docker compose down -v
```

### Restart After Changes
```bash
sudo docker compose up -d --build
```

---

## 🐛 Troubleshooting

### "Permission denied" Docker Error

Fix Docker permissions:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

Or just use `sudo` with docker commands.

### Port 80 Already in Use

Edit `docker-compose.yml` and change:
```yaml
ports:
  - "8080:80"  # Use port 8080 instead
```

Then access at http://localhost:8080

### Port 3000 Already in Use

If you have something on port 3000 (likely your Coolify agent):
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

Update `client/.env`:
```bash
VITE_API_BASE_URL=http://localhost:3001
```

Rebuild frontend:
```bash
sudo docker compose up -d --build tf-frontend
```

### Backend Won't Start

Check logs:
```bash
sudo docker compose logs backend
```

Common issues:
- Database not ready: Wait 10 seconds and try again
- Missing .env file: Run `./scripts/setup-coolify.sh`
- Port conflict: Change PORT in docker-compose.yml

### Frontend Shows Blank Page

1. Check if backend is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check browser console for errors (F12)

3. Verify API URL in client/.env matches backend

4. Rebuild frontend:
   ```bash
   sudo docker compose up -d --build tf-frontend
   ```

---

## 📚 Next Steps

### After Reviewing Locally

1. **Deploy to Coolify**: Follow `DEPLOYMENT_GUIDE.md`
2. **Add Custom Domain**: Configure in Coolify
3. **Setup HTTPS**: Use Coolify's built-in SSL
4. **Configure Backups**: Setup automated database backups

### Customization

1. **Change Admin Password**: Settings → User Management
2. **Add AI API Keys**: Settings → AI Configuration
3. **Add Your Instances**: Instance Manager → Add Instance
4. **Test Migration**: Add 2 instances and try migration feature

---

## 📖 Documentation

- **Full Documentation**: `README.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **API Reference**: `docs/PHASE_2_SUMMARY.md`
- **Architecture**: `docs/CONTEXT_ANCHOR.md`

---

## 🎉 You're Ready!

TalonForge is now built and ready to deploy. Run `./deploy-local.sh` to get started!

For Coolify deployment, see `DEPLOYMENT_GUIDE.md`.

**Questions?** Check the documentation in the `docs/` folder.
