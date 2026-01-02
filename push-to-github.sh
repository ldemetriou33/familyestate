#!/bin/bash

echo "🚀 Pushing all changes to GitHub..."

cd /Users/johnalexander/Desktop/abbey-os-final

# Add all files
echo "📝 Adding all files..."
git add -A

# Show what will be committed
echo ""
echo "Files to be committed:"
git status --short

# Commit
echo ""
echo "💾 Committing..."
git commit -m "Complete Strategic Core: Portfolio Overview, SONIA tracker, Hotel & Cafe sections + Auto-deploy setup"

# Push
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Check: https://github.com/ldemetriou33/familyestate"
else
    echo ""
    echo "❌ Push failed. Try running manually:"
    echo "   git push origin main"
fi

