# Deploy TalonForge to Coolify Using Git

This is the recommended way to deploy TalonForge to Coolify!

## Option 1: Use Local Git Repository (Easiest)

Coolify can deploy directly from your local Git repository.

### Step 1: Verify Git is Ready

Your Git repository is already set up and committed! Run this to confirm:

```bash
git log --oneline -1
```

You should see the latest commit.

### Step 2: Deploy in Coolify

1. Go to Coolify at **http://10.0.0.1:8000**
2. Click **"+ Add"** or **"Resources"** → **"Application"**
3. Select **"Git Repository"**

### Step 3: Configure Git Source

**Source Type:** Select **"Local"** or **"Custom Git"**

**Repository Path:**
```
/home/dad/Documents/talononebuild
```

**Branch:**
```
master
```

**Build Pack:** Select **"Docker Compose"**

Click **"Continue"** or **"Save"**

### Step 4: Add Environment Variables

Go to **"Environment"** tab and add these:

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

### Step 5: Deploy

1. Click **"Deploy"**
2. Coolify will pull from your local Git repo and deploy
3. Wait 3-5 minutes for build to complete

### Step 6: After Deployment

Run these commands to set up the database:

```bash
# Wait for containers to fully start
sleep 20

# Run migrations
sudo docker exec talonforge-backend npx prisma migrate deploy

# Seed database
sudo docker exec talonforge-backend npx prisma db seed
```

### Step 7: Access TalonForge

Open: **http://10.0.0.1:8080**

Login:
- **Email:** admin@talonforge.io
- **Password:** admin123

---

## Option 2: Push to GitHub/GitLab (For Remote Access)

If you want to access TalonForge from anywhere or collaborate with others:

### Step 1: Create Remote Repository

Create a new repository on GitHub or GitLab (don't initialize with README).

### Step 2: Push Code

```bash
# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/talonforge.git

# Push code
git push -u origin master
```

### Step 3: Deploy in Coolify

1. In Coolify, click **"+ Add"** → **"Application"** → **"Git Repository"**
2. Select **"GitHub"** or **"GitLab"**
3. Connect your account (follow Coolify's OAuth flow)
4. Select your **TalonForge** repository
5. Select **master** branch
6. Build Pack: **"Docker Compose"**
7. Add environment variables (same as above)
8. Click **"Deploy"**

### Benefits of Remote Git:
- Deploy from anywhere
- Automatic deployments on git push (if you enable webhooks)
- Easy rollbacks to previous commits
- Collaboration with team members

---

## Making Changes and Redeploying

### With Local Git:
```bash
# Make your changes to code
git add -A
git commit -m "feat: your change description"

# In Coolify, click "Redeploy" - it will pull latest commit
```

### With Remote Git:
```bash
# Make your changes
git add -A
git commit -m "feat: your change description"
git push

# Coolify auto-deploys (if webhooks enabled) or click "Redeploy"
```

---

## Why Git Deployment is Better

✅ **Version Control** - Track all changes, rollback if needed
✅ **Clean Deployments** - Coolify always deploys from clean Git state
✅ **Auto-Deploy** - Push code → Automatic deployment
✅ **Team Collaboration** - Multiple developers can work together
✅ **History** - See what changed and when
✅ **Easier Rollbacks** - Deploy any previous commit

---

## Current Status

✅ Git repository initialized
✅ All code committed
✅ .gitignore configured (protects .env files)
✅ Ready to deploy via Coolify!

**Recommended:** Start with Option 1 (Local Git) to get it working quickly, then optionally move to Option 2 (Remote Git) later if needed.
