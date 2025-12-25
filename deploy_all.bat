@echo off
echo [TaskLane] ULTIMATE ONE-CLICK DEPLOY (GitHub + Vercel)
echo --------------------------------------------------

:: 1. Sync to GitHub
echo [1/3] Syncing to GitHub...
git add .
git commit -m "TaskLane: Production Redirect Fix & Automation Update"
git push origin main --force

:: 2. Sync to Vercel
echo [2/3] Syncing to Vercel...
node vercel-deploy.js

echo --------------------------------------------------
echo [3/3] DONE! Your app is fully updated on GitHub and Live on Vercel.
pause
