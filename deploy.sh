#!/bin/bash

# Netlify Deployment Script for Ndu AI Learning System

echo "🚀 Starting Netlify Deployment Process..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
echo ""
echo "⚠️  IMPORTANT: Before deploying, make sure:"
echo "   1. Firebase authorized domains includes: ndusai.netlify.app"
echo "   2. All environment variables are set in Netlify Dashboard"
echo "   3. You have netlify-cli installed: npm install -g netlify-cli"
echo ""
read -p "Press Enter to continue with deployment..."

netlify deploy --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🔗 Your site is live at: https://ndusai.netlify.app"
    echo ""
    echo "📋 Post-Deployment Checklist:"
    echo "   [ ] Test Google Sign-In"
    echo "   [ ] Test Email/Password Sign-In"
    echo "   [ ] Test Sign-Out"
    echo "   [ ] Check Yoco payments"
    echo "   [ ] Verify AI chat functionality"
else
    echo "❌ Deployment failed!"
    exit 1
fi
