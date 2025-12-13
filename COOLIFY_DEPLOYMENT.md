# Deploy TalonForge to Coolify - Step by Step

Follow these steps to deploy TalonForge to your Coolify instance at http://localhost:8000

---

## Step 1: Create PostgreSQL Database in Coolify

1. **Open Coolify**: http://localhost:8000
2. **Navigate to your project** or create a new one
3. **Click "Add Resource"** → **"Database"** → **"PostgreSQL"**
4. **Configure the database:**
   - Name: `talonforge-db`
   - PostgreSQL Version: 15 or 16
   - Database Name: `talonforge`
   - Username: `talonforge`
   - Password: `talonforge123` (or generate a secure one)
5. **Click "Create"**
6. **Copy the DATABASE_URL** - you'll need this! It looks like:
   ```
   postgresql://talonforge:talonforge123@<container-name>:5432/talonforge
   ```

---

## Step 2: Add TalonForge Application to Coolify

### Option A: Using Local Directory (Easiest)

1. In Coolify, **click "Add Resource"** → **"Application"**
2. **Source**: Choose **"Local"** or **"Dockerfile"**
3. **Project Directory**: `/home/dad/Documents/talononebuild`
4. **Build Pack**: **Docker Compose**
5. **Docker Compose Location**: Leave as `docker-compose.yml`
6. Click **"Continue"**

### Option B: Using Git Repository

If you have a Git remote:

1. In Coolify, **click "Add Resource"** → **"Application"**
2. **Source**: Choose **"Git Repository"**
3. **Repository URL**: Your Git URL
4. **Branch**: `master`
5. **Build Pack**: **Docker Compose**
6. Click **"Continue"**

---

## Step 3: Configure Environment Variables

In Coolify, navigate to your TalonForge application → **Environment Variables**

Add these variables:

```bash
# Database (use the URL from Step 1)
DATABASE_URL=postgresql://talonforge:talonforge123@<your-db-container>:5432/talonforge

# Security Keys (copy from your .env file)
ENCRYPTION_KEY=<copy-from-.env-file>
JWT_SECRET=<copy-from-.env-file>

# Server Configuration
PORT=3000
NODE_ENV=production

# Optional: Internal DB config (if NOT using Coolify managed DB)
POSTGRES_DB=talonforge
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
```

**To get your security keys:**
```bash
cat /home/dad/Documents/talononebuild/.env | grep -E "ENCRYPTION_KEY|JWT_SECRET"
```

---

## Step 4: Configure Ports and Domains

1. **Backend Service (tf-backend)**:
   - Port: 3000
   - Expose to public: Yes (or use internal networking)

2. **Frontend Service (tf-frontend)**:
   - Port: 80
   - Domain: Set your domain or use Coolify's generated one
   - This is your main access point!

3. **Database (tf-db)**:
   - If using Coolify managed DB: Skip this
   - If using internal DB: No public exposure needed

---

## Step 5: Deploy!

1. Click **"Deploy"** in Coolify
2. **Watch the build logs** - should take 3-5 minutes
3. Wait for status to show **"Running"**

---

## Step 6: Post-Deployment Database Setup

After deployment succeeds, run these commands:

### Find Your Backend Container Name

In Coolify → Your App → **Containers** tab, find the backend container name.

Or run:
```bash
sudo docker ps | grep talonforge-backend
```

### Run Migrations and Seed

```bash
# Run migrations
sudo docker exec <backend-container-name> npx prisma migrate deploy

# Seed database with admin user
sudo docker exec <backend-container-name> npx prisma db seed
```

**Example:**
```bash
sudo docker exec talonforge-backend npx prisma migrate deploy
sudo docker exec talonforge-backend npx prisma db seed
```

---

## Step 7: Access Your Application

1. **Get your domain** from Coolify (usually something like `talonforge.your-coolify-domain.com`)
2. **Visit the URL** in your browser
3. **Login with:**
   - Email: `admin@talonforge.io`
   - Password: `admin123`

---

## Troubleshooting

### Build Fails

**Check build logs in Coolify:**
- Common issue: Missing environment variables
- Solution: Verify all env vars are set correctly

### Database Connection Error

**Symptoms:** Backend shows "Can't connect to database"

**Solutions:**
1. Verify DATABASE_URL is correct
2. Ensure database container is running
3. Check if backend can reach database (network issues)
4. Try internal Docker network name: `talonforge-db:5432`

### Frontend Can't Reach Backend

**Symptoms:** Login fails, API errors in browser console

**Solutions:**
1. Update `VITE_API_BASE_URL` in environment variables
2. Set it to your backend's public URL or internal service name
3. Rebuild frontend service

### Migrations Fail

**Symptoms:** `prisma migrate deploy` fails

**Solutions:**
```bash
# Reset database (WARNING: Deletes all data)
sudo docker exec <backend-container> npx prisma migrate reset

# Or create database manually
sudo docker exec <db-container> psql -U talonforge -c "CREATE DATABASE talonforge;"
```

---

## Viewing Logs

In Coolify:
1. Navigate to your application
2. Click on **Logs** tab
3. Select the container (backend/frontend/database)
4. View real-time logs

Or via CLI:
```bash
# Application logs
sudo docker logs <container-name> -f

# Database logs
sudo docker logs <db-container-name> -f
```

---

## Updating After Changes

1. Make code changes
2. Commit to Git (if using Git source)
3. In Coolify, click **"Redeploy"**
4. Or use the **"Force Rebuild"** option

---

## Using Coolify's Internal Networking

For better security, use Coolify's internal networking:

1. **Backend**: Don't expose publicly, use internal name
2. **Frontend**: Expose to public on your domain
3. **Frontend → Backend**: Use internal service name in `VITE_API_BASE_URL`
   - Example: `http://talonforge-backend:3000`

---

## Next Steps After Deployment

1. ✅ Change default admin password
2. ✅ Set up HTTPS (Coolify handles this automatically)
3. ✅ Configure backups for database
4. ✅ Add your Talon.One and Contentful instances
5. ✅ Test migration features

---

## Need Help?

- **Coolify Docs**: https://coolify.io/docs
- **Check Logs**: Always start with checking logs
- **Database Issues**: Verify DATABASE_URL format
- **Build Issues**: Check environment variables

---

**Your deployment should be ready in about 5-10 minutes total!**

Access TalonForge at your Coolify-assigned domain and start managing your instances! 🚀
