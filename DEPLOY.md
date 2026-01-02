# 🚀 Auto-Deploy Setup Instructions

## ⚡ Quick Start - Push Everything Now

**Run these commands in your terminal:**

```bash
cd /Users/johnalexander/Desktop/abbey-os-final

# Setup auto-deploy hook
chmod +x setup-auto-deploy.sh
./setup-auto-deploy.sh

# Push all current changes to GitHub
git add -A
git commit -m "Complete setup: Auto-deploy to GitHub and Vercel"
git push origin main
```

## ✅ What's Configured

1. **Vercel Configuration** (`vercel.json`) - Ready for deployment
2. **GitHub Actions** (`.github/workflows/deploy.yml`) - Auto-deploy to Vercel
3. **Deployment Scripts** - Easy manual deployment
4. **Auto-deploy Hook** - Pushes automatically after commits

## 🔄 How Auto-Deploy Works

### Option 1: Git Hook (Automatic - Recommended)

After running `./setup-auto-deploy.sh`, every commit automatically pushes:

```bash
git add .
git commit -m "Update code"
# ✅ Automatically pushes to GitHub → Vercel auto-deploys
```

### Option 2: Manual Deployment

```bash
# Quick deploy
./deploy.sh

# Or use npm
npm run deploy

# Or manual
git add -A && git commit -m "Update" && git push origin main
```

### Option 3: File Watcher (Auto-commit + Push)

```bash
npm run watch
# Watches for file changes and auto-commits/pushes
```

## 📦 Vercel Setup

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "Add New Project"**
3. **Import repository:** `ldemetriou33/familyestate`
4. **Vercel will auto-detect Next.js** - just click "Deploy"
5. **Done!** Every push to `main` will auto-deploy

## 🎯 Current Status

**Your code is ready but needs to be pushed to GitHub.**

Run this now:
```bash
git push origin main
```

## 🔧 Troubleshooting

### If push fails:

```bash
# Check remote
git remote -v

# Should show: origin https://github.com/ldemetriou33/familyestate.git

# If SSL error:
git config http.sslVerify false
git push origin main
```

### If Vercel doesn't deploy:

- Check Vercel dashboard → Settings → Git
- Ensure GitHub repo is connected
- Check deployment logs

### Test auto-deploy:

```bash
# Make a small change
echo "// test" >> app/page.tsx

# Commit (will auto-push if hook is set up)
git add app/page.tsx
git commit -m "Test auto-deploy"

# Should automatically push and trigger Vercel
```

## 📝 Files Created

- `vercel.json` - Vercel configuration
- `.github/workflows/deploy.yml` - GitHub Actions for Vercel
- `deploy.sh` - Quick deployment script
- `auto-deploy.js` - File watcher for auto-commit/push
- `setup-auto-deploy.sh` - Sets up git hooks

---

✨ **After pushing, your site will be live on Vercel!**

