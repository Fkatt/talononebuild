# Deploy TalonForge to Coolify - Just Follow These Clicks

**Your Coolify URL:** http://10.0.0.1:8000

Just follow these exact steps. Don't worry about understanding, just click what I tell you!

---

## Part 1: Create Database (2 minutes)

### Click 1: Open Coolify
1. Open your browser
2. Go to: **http://10.0.0.1:8000**
3. Login if needed

### Click 2: Add Database
1. Look for a **"+ Add"** button or **"Resources"** in the sidebar
2. Click **"+ Add"** or **"New Resource"**
3. Look for **"Database"** and click it
4. Click **"PostgreSQL"**

### Click 3: Configure Database
Fill in these exact values:
- **Name**: `talonforge-db`
- **Database Name**: `talonforge`
- **Username**: `talonforge`
- **Password**: `talonforge123`
- **Version**: Keep default (15 or 16)

### Click 4: Create It
1. Click **"Create"** or **"Deploy"** button (usually blue/green button at bottom)
2. Wait about 30 seconds
3. **IMPORTANT**: Look for **"Connection URL"** or **"DATABASE_URL"**
4. It will look like: `postgresql://talonforge:talonforge123@xxxxx:5432/talonforge`
5. **Copy this entire URL** - you need it in Part 2!

---

## Part 2: Add TalonForge Application (3 minutes)

### Click 1: Add New Application
1. Go back to main Coolify page (click logo or "Dashboard")
2. Click **"+ Add"** again
3. Click **"Application"** or **"Service"**

### Click 2: Choose Source
1. Look for **"Source"** or **"Repository"** section
2. Select **"Local Directory"** or **"Dockerfile"**
3. In the path field, type: `/home/dad/Documents/talononebuild`
4. Click **"Continue"** or **"Next"**

### Click 3: Choose Build Type
1. Look for **"Build Pack"** or **"Type"**
2. Select **"Docker Compose"**
3. It should auto-detect `docker-compose.yml`
4. Click **"Continue"** or **"Save"**

---

## Part 3: Add Environment Variables (2 minutes)

### This is the most important part!

1. In your new application, find **"Environment"** or **"Variables"** tab
2. Click it
3. Look for **"Add Variable"** or just text boxes

### Add these variables ONE BY ONE:

**Variable 1:**
- Name: `DATABASE_URL`
- Value: `<PASTE THE URL YOU COPIED FROM PART 1 STEP 4>`

**Variable 2:**
- Name: `ENCRYPTION_KEY`
- Value: `be7f2d9066f50eb6a54c3ac987ab90da8923a6b7e36b404cd5a09c7b0e3b3576`

**Variable 3:**
- Name: `JWT_SECRET`
- Value: `560bfc393b4e7c7addad78dd0013839d166f0768c0b39fbf60d48c7bb9165e84fbc275bab59cd5860446583afe1a919582d813834278166d4d66e9a9cc0a3352`

**Variable 4:**
- Name: `PORT`
- Value: `3000`

**Variable 5:**
- Name: `NODE_ENV`
- Value: `production`

### Save
Click **"Save"** button (usually at top or bottom)

---

## Part 4: Deploy! (5 minutes - automatic)

### Click 1: Deploy
1. Find the big **"Deploy"** button (usually top right, blue or green)
2. Click it!

### Click 2: Watch Logs
1. Click **"Logs"** tab to watch it build
2. You'll see lots of text scrolling
3. Wait for it to say **"Running"** or show green status
4. This takes about 5 minutes - **don't close the page!**

---

## Part 5: Setup Database (1 minute)

### After deployment shows "Running", open your terminal and run these commands:

```bash
# Find your backend container
sudo docker ps | grep talonforge-backend

# You'll see something like: talonforge-backend or coolify-talonforge-backend

# Run migrations (use the exact name you see)
sudo docker exec talonforge-backend npx prisma migrate deploy

# Seed database
sudo docker exec talonforge-backend npx prisma db seed
```

You should see:
```
✅ Created admin user: admin@talonforge.io
🎉 Seeding completed!
```

---

## Part 6: Access TalonForge! 🎉

### Get Your URL
1. In Coolify, look for your application
2. Find **"Domains"** section or **"URL"**
3. Click the URL or copy it

### Login
1. Open the URL in your browser
2. You should see TalonForge login page
3. **Login with:**
   - Email: `admin@talonforge.io`
   - Password: `admin123`

---

## 🎉 Done!

You should now see the TalonForge dashboard!

### What to do next:
1. Change your password (go to Settings)
2. Click "Instance Manager"
3. Click "Add Instance"
4. Try adding a test instance

---

## ❌ If Something Goes Wrong

### Can't find DATABASE_URL in Part 1?
- Look for "Connection String" or "URL" in the database page
- Or check database container logs in Coolify

### Deploy button stuck or failed?
- Check the **Logs** tab for red error messages
- Make sure all 5 environment variables are added correctly
- Try clicking "Redeploy" or "Force Rebuild"

### Can't run docker commands in Part 5?
Try with different container names:
```bash
sudo docker ps -a | grep talon
```
Look for any container with "backend" in the name, use that exact name

### Login page doesn't appear?
- Make sure deployment shows "Running" (green status)
- Check if frontend container is running
- Wait another minute and refresh

---

## 📞 Still Stuck?

Take a screenshot of:
1. The Coolify page you're on
2. Any error messages
3. The deployment logs

And I can help you troubleshoot!

---

**Ready? Start with Part 1! Open http://10.0.0.1:8000 now!** 🚀
