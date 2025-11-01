# Firebase Configuration Guide

## Overview

This document provides a guide for setting up Firebase for the Ndu AI Learning System. The application uses Firebase for:

- Authentication (email/password and Google sign-in)
- Firestore database
- Storage
- Analytics

## Environment Variables

For security reasons, Firebase configuration is stored in environment variables. In development, these are loaded from the `.env` file. In production, these should be set in your hosting environment.

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBKgjQnf__SzIuP-pl-SUxyDyDCbJOpLbQ
VITE_FIREBASE_AUTH_DOMAIN=ndu-ai-lms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ndu-ai-lms
VITE_FIREBASE_STORAGE_BUCKET=ndu-ai-lms.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=377111671886
VITE_FIREBASE_APP_ID=1:377111671886:web:a6b2e7cbc13939696f7f1f
VITE_FIREBASE_MEASUREMENT_ID=G-XRP4PYG1MH
```

## Service Account

For server-side operations, a Firebase service account is required. The service account file should be stored securely in `config/firebase-service-account.json` and never committed to version control.

## Firebase Project Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Add a web app to your project
3. Enable Email/Password and Google authentication methods in the Firebase console
4. Create Firestore database and configure rules according to `firebase-rules.md`
5. Configure Firebase Storage rules for secure file uploads

## Troubleshooting

### API Key Invalid

If you see errors like "API key not valid. Please pass a valid API key", check that:

1. Your API key in the `.env` file is correct
2. You've registered the app correctly in the Firebase console
3. You've enabled the necessary APIs in the Google Cloud Console
4. Your Firebase project billing status is active (if required)

### Authentication Failed

If authentication fails:

1. Check that the authentication methods are enabled in the Firebase console
2. Verify that your domain is whitelisted for OAuth redirects (for Google sign-in)
3. Test with a known working account to rule out user-specific issues

### Firestore Connection Issues

If you cannot connect to Firestore:

1. Verify that Firestore is enabled in your Firebase project
2. Check that your service account has the necessary permissions
3. Ensure your project is in the correct region
4. Run the test script `node firebase-test.mjs` to validate your connection

## Firebase CLI

For administrative tasks, install the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init
```

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
