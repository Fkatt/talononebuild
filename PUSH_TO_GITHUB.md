# Push TalonForge to GitHub (neurobeta repo)

I've configured the Git remote to point to your repository:
**https://github.com/Fkatt/neurobeta**

Now you need to authenticate with GitHub to push. Choose one of these methods:

---

## Option 1: GitHub Personal Access Token (Easiest)

### Step 1: Create a Personal Access Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: **"TalonForge Deployment"**
4. Set expiration: **90 days** (or your preference)
5. Check these scopes:
   - ✅ **repo** (Full control of private repositories)
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push with Token

Run this command (replace `YOUR_TOKEN` with the token you just copied):

```bash
git push -u origin master
```

When prompted:
- **Username:** `Fkatt`
- **Password:** Paste your token (not your GitHub password!)

---

## Option 2: GitHub CLI (Recommended for Long-term)

### Step 1: Install GitHub CLI

```bash
# Install gh CLI
sudo apt update
sudo apt install gh -y
```

### Step 2: Authenticate

```bash
gh auth login
```

Follow the prompts:
- What account: **GitHub.com**
- Protocol: **HTTPS**
- Authenticate: **Login with a web browser**
- Copy the one-time code and paste it in your browser

### Step 3: Push

```bash
git push -u origin master
```

---

## Option 3: SSH Keys (Most Secure)

### Step 1: Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press Enter to accept defaults.

### Step 2: Add to GitHub

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the output, then:
1. Go to: **https://github.com/settings/keys**
2. Click **"New SSH key"**
3. Paste your key
4. Click **"Add SSH key"**

### Step 3: Change Remote to SSH

```bash
git remote set-url origin git@github.com:Fkatt/neurobeta.git
```

### Step 4: Push

```bash
git push -u origin master
```

---

## After Successful Push

Once you've pushed the code, you'll see:

```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (150/150), 45.6 KiB | 5.0 MiB/s, done.
Total 150 (delta 30), reused 0 (delta 0), pack-reused 0
To https://github.com/Fkatt/neurobeta.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

Then your code is live at: **https://github.com/Fkatt/neurobeta**

**Next:** I'll help you configure Coolify to deploy from this repo!

---

## Troubleshooting

**Error: "Authentication failed"**
- Make sure you're using the token as the password, not your GitHub password
- Check that the token has `repo` scope

**Error: "Permission denied"**
- Double-check your username is exactly: `Fkatt`
- Regenerate your token with correct permissions

---

**Recommendation:** Use Option 2 (GitHub CLI) - it's the easiest for ongoing work!
