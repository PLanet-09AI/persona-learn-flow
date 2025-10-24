# 🔐 Yoco Payment Setup Guide - CRITICAL FIX

## Problem Summary
```
❌ Error: Payment service not configured - YOCO_SECRET_KEY missing
```

The Netlify function was unable to access the Yoco API key from environment variables.

## Root Cause
The `YOCO_SECRET_KEY` was hardcoded in `netlify.toml` which:
1. ❌ Is a security risk (secrets in source control)
2. ❌ May not propagate to Netlify Functions properly
3. ❌ Can't be easily changed without redeploy

## Solution Applied

### ✅ Fixed netlify.toml
**Removed** hardcoded secrets:
```diff
- [functions.yoco]
-   included_files = ["netlify/functions/**/*"]
-   environment = { YOCO_SECRET_KEY = "sk_test_443a9ffcR4ArAmZ7e144502b4b1a" }
```

**Replaced with** proper environment variable handling:
```toml
[functions.yoco]
  included_files = ["netlify/functions/**/*"]
```

### ✅ Enhanced Yoco Function
`netlify/functions/yoco/index.ts` now:
- ✅ Logs environment variable existence check
- ✅ Has multiple fallback sources (YOCO_SECRET_KEY, YOCO_API_KEY)
- ✅ Better error messages showing what was checked
- ✅ More robust error handling

### ✅ Updated Configuration Files
- ✅ `.env.example` updated with all necessary variables
- ✅ Removed hardcoded secrets
- ✅ Added comments for Netlify setup

## How to Fix: Step-by-Step

### Step 1: Get Your Yoco API Keys

1. Log into Yoco Dashboard: https://dashboard.yoco.com
2. Go to Settings → API Keys
3. Copy:
   - **Secret Key** (starts with `sk_live_` or `sk_test_`)
   - **Public Key** (starts with `pk_live_` or `pk_test_`)

### Step 2: Add to Netlify Environment

1. Go to Netlify Dashboard
2. Select your site: `nduailms` (or your site name)
3. Go to: **Site Settings** → **Build & Deploy** → **Environment**
4. Click **Add environment variable**
5. Add these variables:

**Variable 1:**
```
Name: YOCO_SECRET_KEY
Value: sk_test_443a9ffcR4ArAmZ7e144502b4b1a  (your actual key)
Encrypt: ✅ YES (important!)
```

**Variable 2:**
```
Name: VITE_YOCO_PUBLIC_KEY
Value: pk_test_your_public_key_here
Encrypt: ✅ YES (important!)
```

### Step 3: Redeploy

1. Go to **Deploys** in Netlify
2. Click **Trigger deploy** or push new commit
3. Wait for build to complete

### Step 4: Test

Test in browser console:
```javascript
// Test the Yoco function
const response = await fetch('/.netlify/functions/yoco', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100,
    currency: 'ZAR',
    cancelUrl: 'https://yourdomain.com/cancel',
    successUrl: 'https://yourdomain.com/success'
  })
});

const result = await response.json();
console.log('Checkout result:', result);
```

Expected success response:
```json
{
  "id": "co_xxxxx",
  "redirectUrl": "https://payments.yoco.com/checkout/co_xxxxx",
  "status": "pending"
}
```

## Environment Variable Reference

### Required Variables

| Variable | Purpose | Example | Where |
|----------|---------|---------|-------|
| `YOCO_SECRET_KEY` | Yoco API authentication | `sk_test_443a9ffc...` | Netlify Env |
| `VITE_YOCO_PUBLIC_KEY` | Frontend Yoco key | `pk_test_xxx...` | Netlify Env |

### Optional Variables

| Variable | Purpose | Where |
|----------|---------|-------|
| `VITE_FIREBASE_*` | Firebase config | Netlify Env |
| `VITE_OPENROUTER_*` | OpenRouter API keys | Netlify Env |

## File Changes Summary

### Modified Files
1. **netlify.toml**
   - Removed hardcoded YOCO_SECRET_KEY
   - Functions now use Netlify environment variables

2. **netlify/functions/yoco/index.ts**
   - Enhanced error logging
   - Multiple fallback sources
   - Better diagnostics

3. **.env.example**
   - Added all necessary variables
   - Added setup instructions
   - Clarified which go to Netlify

## Troubleshooting

### Still Getting "YOCO_SECRET_KEY missing"?

1. **Check Netlify Environment Variables**
   - Site Settings → Build & Deploy → Environment
   - Verify `YOCO_SECRET_KEY` is set
   - Verify it's not empty

2. **Check Variable Name**
   - Must be exactly: `YOCO_SECRET_KEY` (case-sensitive)
   - No typos or extra spaces

3. **Redeploy Required**
   - Environment changes require a new deploy
   - Go to Deploys → Trigger deploy
   - Wait for build to complete (~2-3 min)

4. **Check Function Logs**
   - Netlify Dashboard → Functions → yoco
   - Check logs for environment variable checks
   - Look for which variables were found

5. **Verify API Key Format**
   - Must start with `sk_test_` or `sk_live_`
   - Not the public key (starts with `pk_`)

### Getting "Yoco API Error"?

1. **Wrong Secret Key**
   - Verify it's the SECRET key, not PUBLIC key
   - Check for typos

2. **Wrong Mode**
   - Using `sk_test_` for live? Won't work with live Yoco
   - Using `sk_live_` for test? Won't work with test Yoco

3. **Request Format Wrong**
   - Check `cancelUrl` and `successUrl` are valid URLs
   - Check `amount` is a valid number (in cents)

## Security Best Practices

✅ **Do:**
- Store API keys in Netlify environment variables
- Mark as "Encrypt" when adding
- Use secret keys in backend only
- Use public keys in frontend
- Never commit secrets to git

❌ **Don't:**
- Hardcode secrets in netlify.toml
- Store secrets in .env file in repo
- Share API keys via Slack/email
- Use production keys for testing
- Commit .env files with real keys

## Testing Payment Flow

### Local Development

1. Create `.env.local` in root:
```
YOCO_SECRET_KEY=sk_test_443a9ffcR4ArAmZ7e144502b4b1a
```

2. Run: `npm run dev`

3. Function available at: `http://localhost:8888/.netlify/functions/yoco`

### Netlify Preview

1. Push to GitHub
2. Netlify auto-deploys
3. Check environment variables set
4. Test at: `https://[preview-id].netlify.app/.netlify/functions/yoco`

### Production

1. Deploy to main
2. Test at: `https://nduailms.netlify.app/.netlify/functions/yoco`
3. Monitor Function logs

## Verification Checklist

- [ ] `YOCO_SECRET_KEY` set in Netlify environment
- [ ] Variable name correct (case-sensitive)
- [ ] API key format correct (starts with `sk_test_` or `sk_live_`)
- [ ] Site redeployed after adding variables
- [ ] netlify.toml has no hardcoded secrets
- [ ] Function logs show "✅ API key found"
- [ ] Yoco API responds successfully
- [ ] Checkout returns valid response

## Additional Resources

- Yoco Documentation: https://developer.yoco.com/
- Netlify Functions: https://docs.netlify.com/functions/overview/
- Environment Variables: https://docs.netlify.com/build-release-manage/environment-variables/

---

**Last Updated**: October 24, 2025  
**Status**: ✅ Fixed  
**Action Required**: Add YOCO_SECRET_KEY to Netlify environment and redeploy
