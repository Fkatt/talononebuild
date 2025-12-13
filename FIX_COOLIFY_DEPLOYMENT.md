# Fix Coolify Deployment - Super Simple Steps

The error happened because Coolify is set to "Dockerfile" mode but we need "Docker Compose" mode.

---

## Step 1: Delete the Failed Deployment

1. In Coolify, go to your TalonForge application
2. Click **"Settings"** or the gear icon
3. Scroll down and click **"Delete"** or **"Remove"**
4. Confirm deletion

---

## Step 2: Create New Application - The RIGHT Way

1. In Coolify, click **"+ Add"** or **"Resources"**
2. Click **"Application"**

### Choose Source:
- **Type**: Select **"Docker Compose"** (NOT Dockerfile!)
- **Source**: Select **"Local Directory"**
- **Path**: Enter `/home/dad/Documents/talononebuild`
- Click **"Continue"**

### Build Settings:
- **Docker Compose File**: Should auto-detect `docker-compose.yml` ✅
- **Build Type**: Should show "Docker Compose" ✅
- Click **"Save"** or **"Continue"**

---

## Step 3: Add Environment Variables

Click on **"Environment"** tab and add these:

```
DATABASE_URL=postgresql://user:pass@tf-db:5432/talonforge
ENCRYPTION_KEY=be7f2d9066f50eb6a54c3ac987ab90da8923a6b7e36b404cd5a09c7b0e3b3576
JWT_SECRET=560bfc393b4e7c7addad78dd0013839d166f0768c0b39fbf60d48c7bb9165e84fbc275bab59cd5860446583afe1a919582d813834278166d4d66e9a9cc0a3352
PORT=3000
NODE_ENV=production
POSTGRES_DB=talonforge
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
```

Click **"Save"**

---

## Step 4: Deploy

1. Click the **"Deploy"** button
2. Wait for it to build (5 minutes)
3. Watch for "Running" status

---

## Step 5: After Deployment

Run these commands in your terminal:

```bash
# Find backend container
sudo docker ps | grep talonforge-backend

# Run migrations
sudo docker exec talonforge-backend npx prisma migrate deploy

# Seed database
sudo docker exec talonforge-backend npx prisma db seed
```

---

## Step 6: Access TalonForge

Look for the URL in Coolify or access at:
- **http://10.0.0.1:8080** (frontend)
- **http://10.0.0.1:3000** (backend API)

Login:
- Email: admin@talonforge.io
- Password: admin123

---

## ⚠️ Key Point:

**MUST select "Docker Compose" NOT "Dockerfile"** when creating the application!

---

That's it! Try this and let me know if you see any errors.
