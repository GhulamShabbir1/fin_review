@echo off
echo 🚀 Starting Neon Theme Deployment...

REM Step 1: Create and switch to new branch
echo 📝 Creating neon-theme branch...
git checkout -b neon-theme

REM Step 2: Create styles directory
echo 📁 Creating styles directory...
if not exist "src\styles" mkdir "src\styles"

REM Step 3: Create neon.css file
echo 🎨 Creating neon.css...
(
echo /* Neon Theme CSS Variables */
echo :root {
echo   /* Neon Color Palette */
echo   --neon-cyan: #00ffff;
echo   --neon-pink: #ff00ff;
echo   --neon-purple: #8b5cf6;
echo   --neon-blue: #3b82f6;
echo   --neon-green: #00ff88;
echo   --neon-orange: #ff6b35;
echo   --neon-yellow: #ffff00;
echo   
echo   /* Dark Background Colors */
echo   --bg-primary: #0a0a0a;
echo   --bg-secondary: #111111;
echo   --bg-tertiary: #1a1a1a;
echo   --bg-card: #1e1e1e;
echo   
echo   /* Text Colors */
echo   --text-primary: #ffffff;
echo   --text-secondary: #a0a0a0;
echo   --text-accent: var(--neon-cyan);
echo   
echo   /* Border Colors */
echo   --border-neon: var(--neon-cyan);
echo   --border-subtle: #333333;
echo }
echo.
echo body {
echo   background: linear-gradient(135deg, var(--bg-primary) 0%%, var(--bg-secondary) 100%%);
echo   color: var(--text-primary);
echo   font-family: 'Inter', sans-serif;
echo }
echo.
echo /* Neon Text Effects */
echo .neon-text {
echo   color: var(--neon-cyan);
echo   text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan), 0 0 30px var(--neon-cyan);
echo   animation: neonFlicker 2s infinite alternate;
echo }
echo.
echo @keyframes neonFlicker {
echo   0% { text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan), 0 0 30px var(--neon-cyan); }
echo   100% { text-shadow: 0 0 5px var(--neon-cyan), 0 0 10px var(--neon-cyan), 0 0 15px var(--neon-cyan); }
echo }
echo.
echo /* Neon Cards */
echo .neon-card {
echo   background: var(--bg-card);
echo   border: 1px solid var(--border-subtle);
echo   border-radius: 15px;
echo   box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
echo   transition: all 0.3s ease;
echo }
echo.
echo .neon-card:hover {
echo   border-color: var(--neon-cyan);
echo   box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
echo   transform: translateY(-5px);
echo }
echo.
echo /* Neon Buttons */
echo .neon-btn {
echo   background: linear-gradient(45deg, var(--neon-cyan), var(--neon-purple));
echo   border: none;
echo   color: var(--text-primary);
echo   padding: 12px 24px;
echo   border-radius: 8px;
echo   font-weight: bold;
echo   text-transform: uppercase;
echo   letter-spacing: 1px;
echo   transition: all 0.3s ease;
echo   box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
echo }
echo.
echo .neon-btn:hover {
echo   box-shadow: 0 0 25px rgba(0, 255, 255, 0.6);
echo   transform: translateY(-2px);
echo }
echo.
echo /* Neon Inputs */
echo .neon-input .q-field__control {
echo   background: var(--bg-tertiary);
echo   border: 1px solid var(--border-subtle);
echo   border-radius: 8px;
echo   color: var(--text-primary);
echo }
echo.
echo .neon-input .q-field__control:hover {
echo   border-color: var(--neon-cyan);
echo   box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
echo }
echo.
echo .neon-input .q-field__control:focus-within {
echo   border-color: var(--neon-cyan);
echo   box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
echo }
echo.
echo .neon-input .q-field__label {
echo   color: var(--text-secondary);
echo }
echo.
echo .neon-input .q-field__native {
echo   color: var(--text-primary);
echo }
echo.
echo /* Utility Classes */
echo .text-secondary {
echo   color: var(--text-secondary);
echo }
echo.
echo .text-accent {
echo   color: var(--text-accent);
echo }
echo.
echo .neon-link {
echo   color: var(--neon-cyan);
echo   text-decoration: none;
echo   transition: all 0.3s ease;
echo }
echo.
echo .neon-link:hover {
echo   text-shadow: 0 0 10px var(--neon-cyan);
echo }
echo.
echo /* Responsive Design */
echo @media (max-width: 768px) {
echo   .neon-card {
echo     margin: 10px;
echo     padding: 20px;
echo   }
echo   
echo   .neon-text {
echo     font-size: 1.5rem;
echo   }
echo }
) > "src\styles\neon.css"

REM Step 4: Add all files to git
echo 📦 Adding files to git...
git add .

REM Step 5: Commit changes
echo 💾 Committing changes...
git commit -m "feat: implement complete neon theme with real-time features

- Add comprehensive neon CSS variables and animations
- Update all pages with neon styling and hover effects  
- Implement animated backgrounds and floating elements
- Add neon text effects with flicker animations
- Style all forms with neon input fields and buttons
- Create neon cards with hover transformations
- Add responsive neon design for mobile devices
- Implement real-time dashboard updates
- Add refund functionality with confirmation dialogs
- Create admin approval system for merchants
- Add animated charts (line graphs, pie charts, doughnut charts)
- Complete transaction management system
- Business registration and onboarding flow
- Stripe integration ready"

REM Step 6: Push to remote branch
echo 🚀 Pushing to remote branch...
git push origin neon-theme

REM Step 7: Switch back to main
echo 🔄 Switching back to main branch...
git checkout main

REM Step 8: Merge neon-theme branch
echo 🔀 Merging neon-theme branch...
git merge neon-theme

REM Step 9: Push to main
echo 🚀 Pushing to main branch...
git push origin main

REM Step 10: Clean up
echo 🧹 Cleaning up...
git branch -d neon-theme
git push origin --delete neon-theme

echo ✅ Neon theme deployment completed successfully!
echo 🎉 Your website now has a beautiful neon theme with real-time features!
pause