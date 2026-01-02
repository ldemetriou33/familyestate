# 🚀 START HERE - Auto-Deploy Setup

## ⚡ STEP 1: Push Everything to GitHub (DO THIS NOW!)

Open your terminal and run:

```bash
cd /Users/johnalexander/Desktop/abbey-os-final

# Setup the auto-push hook
chmod +x setup-auto-deploy.sh
./setup-auto-deploy.sh

# Push all your code to GitHub
git add -A
git commit -m "Complete setup: Auto-deploy to GitHub and Vercel"
git push origin main
```

**This will upload all your new code to GitHub!**

## ✅ STEP 2: Connect to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New Project"**
3. Find and select **`ldemetriou33/familyestate`**
4. Click **"Deploy"** (Vercel auto-detects Next.js)
5. **Done!** Your site will be live in ~2 minutes

## 🎯 STEP 3: How It Works Going Forward

After setup, **every time you save and commit code**, it will:

1. ✅ **Automatically push to GitHub** (via git hook)
2. ✅ **Automatically deploy on Vercel** (via Vercel's GitHub integration)
3. ✅ **Update your live website** (in ~2 minutes)

### Example Workflow:

```bash
# Make changes to your code
# Save files

# Commit (this will auto-push!)
git add .
git commit -m "Update portfolio section"

# That's it! Vercel will auto-deploy in ~2 minutes
```

## 📁 What's Been Set Up

✅ **Vercel Configuration** (`vercel.json`)  
✅ **GitHub Actions** (`.github/workflows/deploy.yml`)  
✅ **Auto-push Git Hook** (runs after every commit)  
✅ **Deployment Scripts** (`deploy.sh`, `auto-deploy.js`)  

## 🔧 Manual Deployment (If Needed)

If you need to push manually:

```bash
# Option 1: Use the script
./deploy.sh

# Option 2: Use npm
npm run deploy

# Option 3: Manual
git add -A && git commit -m "Update" && git push origin main
```

## 🆘 Troubleshooting

**If `git push` fails:**
```bash
# Check your remote
git remote -v

# If SSL error:
git config http.sslVerify false
git push origin main
```

**If Vercel doesn't deploy:**
- Check Vercel dashboard → Settings → Git
- Ensure GitHub repo is connected
- Check deployment logs in Vercel

---

## 🎉 You're All Set!

**Run STEP 1 commands above to push your code, then connect to Vercel!**

Your Abbey OS Strategic Core is ready to deploy! 🚀

