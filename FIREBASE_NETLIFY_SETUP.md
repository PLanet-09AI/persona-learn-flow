# Firebase + Netlify Authentication Setup Guide

## 🔥 Firebase Console Configuration Required

To make Google Sign-In work on Netlify, you MUST add your Netlify domain to Firebase's authorized domains.

### Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `ndu-ai-lms`

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Settings" tab
   - Click on "Authorized domains"

3. **Add Your Netlify Domain**
   Add these domains to the authorized list:
   ```
   ndusai.netlify.app
   localhost (should already be there)
   ```

4. **Save Changes**
   - Click "Add domain" for each
   - Wait a few minutes for changes to propagate

## 🌐 Authentication Flow

### Development (localhost)
- Uses **popup-based** authentication
- Immediate feedback
- Better developer experience

### Production (Netlify)
- Uses **redirect-based** authentication
- More reliable with COOP policies
- Better compatibility with hosting providers
- User is redirected to Google, then back to your site

## 🔧 Netlify Configuration

The `netlify.toml` has been configured with proper CORS headers:

```toml
Cross-Origin-Opener-Policy = "same-origin-allow-popups"
Cross-Origin-Embedder-Policy = "unsafe-none"
```

These settings allow Firebase Auth popup to work while maintaining security.

## ✅ Environment Variables for Netlify

Make sure these are set in Netlify Dashboard → Site Settings → Environment Variables:

### Firebase Variables (Required)
```bash
VITE_FIREBASE_API_KEY=AIzaSyBKgjQnf__SzIuP-pl-SUxyDyDCbJOpLbQ
VITE_FIREBASE_AUTH_DOMAIN=ndu-ai-lms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ndu-ai-lms
VITE_FIREBASE_STORAGE_BUCKET=ndu-ai-lms.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=377111671886
VITE_FIREBASE_APP_ID=1:377111671886:web:a6b2e7cbc13939696f7f1f
VITE_FIREBASE_MEASUREMENT_ID=G-XRP4PYG1MH
```

### Site Configuration
```bash
VITE_SITE_URL=https://ndusai.netlify.app
VITE_SITE_NAME=Ndu AI Learning System
```

### API Keys
```bash
VITE_OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_API_KEY=your_openrouter_key
```

### Payment Configuration
```bash
VITE_YOCO_PUBLIC_KEY=your_yoco_public_key
VITE_YOCO_SECRET_KEY=your_yoco_secret_key
VITE_YOCO_MODE=test
```

## 🚀 Deployment Checklist

- [ ] Firebase authorized domains configured
- [ ] Netlify environment variables set
- [ ] `netlify.toml` has correct CORS headers
- [ ] Build succeeds: `npm run build`
- [ ] Deploy to Netlify
- [ ] Test Google Sign-In on production
- [ ] Test email/password authentication

## 🐛 Troubleshooting

### "Cross-Origin-Opener-Policy" Error
- **Solution**: Ensure `netlify.toml` has `same-origin-allow-popups`
- Already fixed in this configuration

### "auth/unauthorized-domain" Error
- **Solution**: Add `ndusai.netlify.app` to Firebase authorized domains
- Go to Firebase Console → Authentication → Settings → Authorized domains

### Popup Blocked
- **Solution**: The app automatically falls back to redirect
- On production, redirect is used by default

### Sign-in Stuck on Loading
- **Cause**: Redirect result not handled
- **Solution**: Already implemented with `getRedirectResult()`

## 📝 Code Implementation

The authentication automatically detects the environment:

```typescript
const isProduction = window.location.hostname !== 'localhost';

if (isProduction) {
  // Redirect-based (Netlify)
  await signInWithRedirect(auth, googleProvider);
} else {
  // Popup-based (Development)
  await signInWithPopup(auth, googleProvider);
}
```

## 🔐 Security Notes

1. **HTTPS Required**: Google Sign-In only works on HTTPS (Netlify provides this)
2. **Authorized Domains**: Only domains in Firebase whitelist can use authentication
3. **API Keys**: Public in frontend code (this is normal for Firebase)
4. **Secret Keys**: Never expose `YOCO_SECRET_KEY` or admin SDK keys in frontend

## ✨ Testing

### Local Testing
```bash
npm run dev
# Test at http://localhost:8080
```

### Production Testing
```bash
npm run build
netlify deploy --prod
# Test at https://ndusai.netlify.app
```

## 📞 Support

If authentication still doesn't work:
1. Check browser console for errors
2. Verify Firebase authorized domains
3. Check Netlify environment variables
4. Ensure CORS headers are deployed
5. Clear browser cache and try again
