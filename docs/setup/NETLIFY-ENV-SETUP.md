# Netlify Environment Variables Setup Guide

## Required Environment Variables for Production

### Core Configuration
- `SITE_URL` - Your Netlify deployed URL (e.g., https://persona-learn-flow.netlify.app)
- `SITE_NAME` - Persona Learn Flow

### OpenRouter Configuration
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `OPENROUTER_DEFAULT_MODEL` - cognitivecomputations/dolphin-mistral-24b-venice-edition:free
- `OPENROUTER_QWEN_API_KEY` - Your Qwen API key
- `OPENROUTER_MOONSHOT_API_KEY` - Your Moonshot API key

### Firebase Configuration
- `FIREBASE_API_KEY` - Your Firebase API key
- `FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `FIREBASE_APP_ID` - Your Firebase app ID
- `FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID

### Yoco Payment Configuration
- `YOCO_PUBLIC_KEY` - Your Yoco public key
- `YOCO_SECRET_KEY` - Your Yoco secret key
- `YOCO_MODE` - test or production

## How to Set Up in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings > Build & deploy > Environment
4. Click "Edit variables"
5. Add each variable listed above
6. Make sure to use production values, not test keys

## Important Notes

- Keep your secret keys secure
- Never commit sensitive keys to git
- Use different keys for development and production
- Test thoroughly after setting environment variables

## Local Development

For local development:
1. Use the `.env.development` file
2. Run `netlify dev` to start the development server
3. Environment variables will be loaded automatically

## Deployment

When deploying:
1. Ensure all environment variables are set in Netlify UI
2. Deploy with `netlify deploy --prod`
3. Verify environment variables in Netlify's deploy logs
