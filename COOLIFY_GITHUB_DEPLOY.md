# Deploy TalonForge from GitHub to Coolify

After you've pushed your code to **https://github.com/Fkatt/neurobeta**, follow these steps to deploy it in Coolify.

---

## Step 1: Connect Coolify to GitHub

1. Go to Coolify: **http://10.0.0.1:8000**
2. Click on **"Settings"** (gear icon) or **"Sources"**
3. Look for **"Git Sources"** or **"Connect Git Provider"**
4. Click **"Add GitHub"** or **"Connect GitHub"**
5. Follow the OAuth flow to authorize Coolify to access your GitHub account

**Note:** Coolify will need permission to read your repositories.

---

## Step 2: Create New Application

1. Click **"+ Add"** or **"Resources"**
2. Click **"Application"**
3. Select **"Git Repository"** or **"Public Repository"**

---

## Step 3: Select Your Repository

**Source:** Select **"GitHub"** (you just connected it)

**Repository:** Find and select:
```
Fkatt/neurobeta
```

**Branch:**
```
master
```

**Build Pack:** Select **"Docker Compose"**

Click **"Continue"** or **"Save"**

---

## Step 4: Configure Build Settings

**Docker Compose File:** Should auto-detect as:
```
docker-compose.yml
```

**Base Directory:** Leave as root:
```
./
```

Click **"Save"**

---

## Step 5: Add Environment Variables

Click on **"Environment"** or **"Environment Variables"** tab.

Add these 8 variables:

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

## Step 6: Deploy!

1. Click the **"Deploy"** button
2. Watch the build logs
3. Wait 3-5 minutes for the build to complete
4. Look for **"Running"** or **"Deployed"** status

---

## Step 7: Setup Database

After deployment succeeds, run these commands in your terminal:

```bash
# Wait for containers to fully start
sleep 20

# Run database migrations
sudo docker exec talonforge-backend npx prisma migrate deploy

# Seed database with admin user
sudo docker exec talonforge-backend npx prisma db seed
```

---

## Step 8: Access TalonForge

Open your browser and go to:
**http://10.0.0.1:8080**

Login with:
- **Email:** admin@talonforge.io
- **Password:** admin123

---

## Step 9: Enable Auto-Deploy (Optional)

To automatically deploy when you push to GitHub:

1. In Coolify, go to your TalonForge application
2. Click **"Settings"**
3. Look for **"Auto Deploy"** or **"Webhooks"**
4. Toggle **"Auto Deploy on Git Push"** to **ON**
5. Coolify will set up a webhook on your GitHub repo

Now whenever you push code:
```bash
git add -A
git commit -m "feat: my new feature"
git push
```

Coolify will automatically deploy the changes!

---

## Troubleshooting

### Error: "Repository not found"
- Make sure you authorized Coolify to access your GitHub account
- Check that the repo is public or Coolify has access to private repos

### Error: "Build failed"
- Check the build logs in Coolify for specific errors
- Verify all environment variables are set correctly

### Container won't start
```bash
# Check container status
sudo docker compose ps

# View logs
sudo docker compose logs -f

# Or view specific service logs
sudo docker compose logs tf-backend
sudo docker compose logs tf-frontend
```

### Can't connect to database
- Make sure the database container is running
- Check DATABASE_URL is correct
- Wait 30 seconds after deployment for database to be ready

---

## Architecture Overview

Your deployment will have:

- **Frontend** (React): Running on port 8080
- **Backend** (Node.js API): Running on port 3000
- **Database** (PostgreSQL): Running internally on port 5432

Coolify manages all these containers via Docker Compose!

---

## Next Steps After Deployment

1. **Test the Application**
   - Create a new Talon.One instance
   - Test connection to Talon.One API
   - Try the migration tools

2. **Customize**
   - Update admin password
   - Configure backup schedules
   - Add team members

3. **Monitor**
   - Check Coolify logs regularly
   - Monitor container health
   - Set up alerts if needed

---

**Ready to deploy?** Follow these steps and let me know if you hit any issues!
