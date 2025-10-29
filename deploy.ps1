# Netlify Deployment Script for Ndu AI Learning System

Write-Host "🚀 Starting Netlify Deployment Process..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Deploy to Netlify
Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Before deploying, make sure:" -ForegroundColor Yellow
Write-Host "   1. Firebase authorized domains includes: ndusai.netlify.app" -ForegroundColor White
Write-Host "   2. All environment variables are set in Netlify Dashboard" -ForegroundColor White
Write-Host "   3. You have netlify-cli installed: npm install -g netlify-cli" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue with deployment"

netlify deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🔗 Your site is live at: https://ndusai.netlify.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Post-Deployment Checklist:" -ForegroundColor Yellow
    Write-Host "   [ ] Test Google Sign-In" -ForegroundColor White
    Write-Host "   [ ] Test Email/Password Sign-In" -ForegroundColor White
    Write-Host "   [ ] Test Sign-Out" -ForegroundColor White
    Write-Host "   [ ] Check Yoco payments" -ForegroundColor White
    Write-Host "   [ ] Verify AI chat functionality" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
