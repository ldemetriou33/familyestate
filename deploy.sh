#!/bin/bash
# Deployment script to push changes to GitHub

echo "🚀 Deploying to GitHub..."

# Add all changes
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    # Commit changes
    git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "✅ Changes committed"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "❌ Push failed. You may need to:"
    echo "   1. Check your GitHub credentials"
    echo "   2. Run: git push origin main"
    echo "   3. Or configure SSL: git config http.sslVerify false"
fi

