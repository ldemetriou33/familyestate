#!/bin/bash

echo "🔧 Setting up auto-deploy..."

# Create git hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create post-commit hook
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
# Auto-push to GitHub after every commit

echo "🚀 Auto-pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub! Vercel will auto-deploy."
else
    echo "⚠️  Push failed. Run 'git push origin main' manually."
fi
EOF

# Make it executable
chmod +x .git/hooks/post-commit

echo "✅ Auto-deploy setup complete!"
echo ""
echo "Now every time you commit, it will automatically push to GitHub."
echo ""
echo "To push your current changes, run:"
echo "  git push origin main"

