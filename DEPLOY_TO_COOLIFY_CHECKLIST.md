# 🚀 Deploy TalonForge to Coolify - Quick Checklist

Follow these steps in order. Should take about 10 minutes total.

---

## ✅ Step 1: Open Coolify

Go to: **http://localhost:8000**

---

## ✅ Step 2: Create PostgreSQL Database

1. Click **"Add Resource"** → **"Database"** → **"PostgreSQL"**
2. Fill in:
   - **Name**: `talonforge-db`
   - **Database**: `talonforge`
   - **Username**: `talonforge`
   - **Password**: `talonforge123` (or your choice)
3. Click **"Create"**
4. **IMPORTANT**: Copy the **DATABASE_URL** shown after creation
   - It looks like: `postgresql://talonforge:talonforge123@xxxxx:5432/talonforge`
   - You'll need this in Step 4!

---

## ✅ Step 3: Add TalonForge Application

1. Click **"Add Resource"** → **"Application"**
2. Choose source:
   - **Option A (Easiest)**: **"Local"** → Directory: `/home/dad/Documents/talononebuild`
   - **Option B**: **"Git"** → URL: (your git repository)
3. **Build Pack**: Select **"Docker Compose"**
4. **Docker Compose File**: `docker-compose.yml` (should auto-detect)
5. Click **"Continue"** or **"Create"**

---

## ✅ Step 4: Add Environment Variables

In your new TalonForge application in Coolify:

1. Go to **"Environment"** or **"Variables"** tab
2. Add these variables (copy from below):

```
DATABASE_URL=postgresql://talonforge:talonforge123@<your-db-host>:5432/talonforge
ENCRYPTION_KEY=be7f2d9066f50eb6a54c3ac987ab90da8923a6b7e36b404cd5a09c7b0e3b3576
JWT_SECRET=560bfc393b4e7c7addad78dd0013839d166f0768c0b39fbf60d48c7bb9165e84fbc275bab59cd5860446583afe1a919582d813834278166d4d66e9a9cc0a3352
PORT=3000
NODE_ENV=production
```

**IMPORTANT**: Replace the `DATABASE_URL` with the one you copied from Step 2!

3. Click **"Save"**

---

## ✅ Step 5: Configure Domains (Optional)

1. In the application settings, go to **"Domains"** tab
2. Set your domain or use Coolify's auto-generated one
3. Note: Frontend will be on port 80, backend on port 3000

---

## ✅ Step 6: Deploy!

1. Click the **"Deploy"** button
2. Watch the build logs (click **"Logs"** to view)
3. Wait for deployment to complete (~5 minutes)
4. Status should show **"Running"** with green indicator

---

## ✅ Step 7: Setup Database (After Deployment)

Once deployment is complete, run these commands in your terminal:

```bash
# Find your backend container
sudo docker ps | grep talonforge-backend

# Run migrations (use the actual container name)
sudo docker exec talonforge-backend npx prisma migrate deploy

# Seed database with admin user
sudo docker exec talonforge-backend npx prisma db seed
```

You should see:
```
✅ Created admin user: admin@talonforge.io
✅ Created system settings
🎉 Seeding completed!
```

---

## ✅ Step 8: Access TalonForge!

1. Get your application URL from Coolify (in the application dashboard)
2. Open it in your browser
3. **Login with:**
   - Email: `admin@talonforge.io`
   - Password: `admin123`

---

## 🎉 You're Done!

TalonForge is now running on Coolify!

### What to do next:

- ✅ Change admin password (Settings)
- ✅ Add your first Talon.One or Contentful instance
- ✅ Test the connection feature
- ✅ Explore the migration features

---

## 🐛 Troubleshooting

### Can't find container for Step 7?

List all containers:
```bash
sudo docker ps -a | grep talon
```

Look for container with "backend" in the name.

### Migrations fail?

Check if database is accessible:
```bash
sudo docker exec <backend-container> npx prisma db push
```

### Application won't start?

Check Coolify logs:
1. Go to your app in Coolify
2. Click **"Logs"** tab
3. Select backend/frontend container
4. Look for error messages

### DATABASE_URL format wrong?

Should be:
```
postgresql://username:password@hostname:5432/database_name
```

Example from Coolify PostgreSQL:
```
postgresql://talonforge:talonforge123@talonforge-db:5432/talonforge
```

---

## 📞 Need Help?

1. Check the detailed guide: `COOLIFY_DEPLOYMENT.md`
2. Check Coolify logs for errors
3. Verify environment variables are set correctly
4. Make sure database is running and accessible

---

**Total Time**: ~10 minutes
**Difficulty**: Easy
**Success Rate**: 99% 😊
