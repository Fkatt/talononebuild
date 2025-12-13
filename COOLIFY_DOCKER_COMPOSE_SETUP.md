# TalonForge Coolify Deployment - Docker Compose Empty Setup

You found the correct screen! Follow these steps exactly:

## Step 1: Select Docker Compose Empty

1. Click **"Docker Compose Empty"**
2. Give it a name: **TalonForge**
3. Click **"Continue"** or **"Next"**

---

## Step 2: Configure Source

You'll need to set where Coolify finds your docker-compose.yml file:

**Project Directory or Source Path:**
```
/home/dad/Documents/talononebuild
```

**Docker Compose File Name** (if asked):
```
docker-compose.yml
```

Click **"Save"** or **"Continue"**

---

## Step 3: Add Environment Variables

Go to the **"Environment"** or **"Environment Variables"** tab and add these:

```
DATABASE_URL=postgresql://user:pass@tf-db:5432/talonforge
ENCRYPTION_KEY=be7f2d9066f50eb6a54c3ac987ab90da8923a6b7e36b404cd5a09c7b0e3b3576
JWT_SECRET=560bfc393b4e7c7addad78dd0013839d166f0768c0b39fbf60d48c7bb9165e84fbc275bab59cd5860446583afe1a919582d813834278166d4d66e9a9cc0a3352
PORT=3000
NODE_ENV=production
POSTGRES_DB=talonforge
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
VITE_API_BASE_URL=http://10.0.0.1:3000
```

Click **"Save"**

---

## Step 4: Deploy

1. Click the **"Deploy"** button
2. Wait 3-5 minutes for the build
3. Watch the logs for any errors

---

## Step 5: After Deployment Succeeds

Once you see "Running" or "Deployed" status, run these commands in your terminal:

```bash
# Wait a moment for containers to fully start
sleep 20

# Run database migrations
sudo docker exec talonforge-backend npx prisma migrate deploy

# Seed the database with admin user
sudo docker exec talonforge-backend npx prisma db seed
```

---

## Step 6: Access TalonForge

Open your browser and go to:
**http://10.0.0.1:8080**

Login with:
- **Email:** admin@talonforge.io
- **Password:** admin123

---

## Troubleshooting

If deployment fails:
- Check Coolify logs for specific errors
- Ensure the path `/home/dad/Documents/talononebuild` is correct
- Verify docker-compose.yml exists in that directory

If containers don't start:
```bash
# Check container status
sudo docker compose ps

# View logs
sudo docker compose logs -f
```

---

That's it! This should work perfectly with the "Docker Compose Empty" option.
