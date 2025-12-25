@echo off
echo [TaskLane] Starting Automatic Deployment...

:: 1. Initialize Git if needed
if not exist .git (
    echo [Git] Initializing repository...
    git init
)

:: 2. Set Remote Origin
echo [Git] Setting remote origin to https://github.com/visualdendy/tasklane.git...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/visualdendy/tasklane.git

:: 3. Stage and Commit
echo [Git] Staging files...
git add .
echo [Git] Committing changes...
git commit -m "TaskLane: Full implementation complete (Profile, Settings, Notifications, Fixed Uploads)"

:: 4. Push to GitHub
echo [Git] Pushing to GitHub (main branch)...
git branch -M main
git push -u origin main --force

echo.
echo [Vercel] Code successfully pushed to GitHub!
echo [Vercel] Please follow these steps to finish deployment:
echo 1. Go to https://vercel.com/new
echo 2. Import the 'tasklane' repository.
echo 3. ADD THESE ENVIRONMENT VARIABLES in Vercel Settings:
echo    - NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
echo    - SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
echo    - JWT_SECRET=YOUR_JWT_SECRET
echo 4. Click 'Deploy'.
echo.
echo [Finished] Your app will be live at https://tasklane.vercel.app (once configured)
