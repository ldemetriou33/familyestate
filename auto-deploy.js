#!/usr/bin/env node

/**
 * Auto-deploy script that watches for file changes and automatically
 * commits and pushes to GitHub, triggering Vercel deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const IGNORE_PATTERNS = [
  /\.git/,
  /node_modules/,
  /\.next/,
  /\.vercel/,
  /\.DS_Store/,
  /\.env/,
  /\.log$/,
];

let isCommitting = false;
let changeTimeout = null;

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function gitAddAndCommit() {
  if (isCommitting) return;
  
  isCommitting = true;
  
  try {
    console.log('📝 Staging changes...');
    execSync('git add -A', { stdio: 'inherit' });
    
    const status = execSync('git status --short', { encoding: 'utf-8' });
    if (!status.trim()) {
      console.log('✅ No changes to commit');
      isCommitting = false;
      return;
    }
    
    console.log('💾 Committing changes...');
    const timestamp = new Date().toISOString();
    execSync(`git commit -m "Auto-deploy: ${timestamp}"`, { stdio: 'inherit' });
    
    console.log('🚀 Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✅ Successfully deployed to GitHub! Vercel will auto-deploy.');
  } catch (error) {
    console.error('❌ Error during deployment:', error.message);
  } finally {
    isCommitting = false;
  }
}

function watchDirectory(dir) {
  console.log(`👀 Watching ${dir} for changes...`);
  
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename || shouldIgnore(filename)) return;
    
    const filePath = path.join(dir, filename);
    
    // Debounce: wait 2 seconds after last change
    if (changeTimeout) {
      clearTimeout(changeTimeout);
    }
    
    changeTimeout = setTimeout(() => {
      console.log(`\n📁 Change detected: ${filename}`);
      gitAddAndCommit();
    }, 2000);
  });
}

// Start watching
const projectRoot = __dirname;
watchDirectory(projectRoot);

console.log('✨ Auto-deploy is active! Changes will be automatically pushed to GitHub.');
console.log('Press Ctrl+C to stop.');
