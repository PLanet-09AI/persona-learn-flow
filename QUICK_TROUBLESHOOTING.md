# Quick Troubleshooting Guide

## Quiz Generation Issues

### Issue: "Error generating quiz" or blank error
**Steps**:
1. Open browser console (F12)
2. Look for the first error message
3. Check if it says "API key not configured"
   - **Fix**: Set `VITE_OPENROUTER_API_KEY` in `.env.development`
4. Check if it says "401 Unauthorized"
   - **Fix**: Verify your API key is correct and not expired
5. Check if it says "Failed to parse AI response"
   - **Fix**: Look at console for raw content to debug
   - This usually means AI returned wrong format

### Issue: Quiz generation is very slow
**Causes & Fixes**:
1. OpenRouter API is slow (wait 10 seconds)
2. Your internet is slow (check connection)
3. API is rate-limited (wait a few minutes)
4. Check server load in OpenRouter dashboard

### Issue: Questions have wrong format or are incomplete
**Fixes**:
1. Refresh the page
2. Try regenerating
3. Check AI prompt in `src/services/quiz.ts`
4. Verify API key is active on OpenRouter

## Payment Issues

### Issue: "POST ...checkout 404"
**Fix**: Ensure `netlify/functions/yoco/checkout.ts` exists

### Issue: "Error creating checkout"
**Steps**:
1. Check if using correct environment (production vs local)
2. Verify `YOCO_SECRET_KEY` is set in Netlify environment
3. Check Yoco API key is valid (not expired)
4. Verify checkout URL is correct: `/.netlify/functions/yoco/checkout`

### Issue: Payment page doesn't load after redirect
**Checks**:
1. Verify cancelUrl, successUrl are correct
2. Check browser console for errors
3. Verify Yoco account is active
4. Test in sandbox mode first

## Local Development Issues

### Issue: "Port 5173 already in use"
**Fix**:
```powershell
# Kill process using port 5173
# Or use different port:
$env:VITE_PORT=3000
npm run dev
```

### Issue: API endpoints returning 404
**Fix**: Make sure you're using correct command:
- **For Vite only**: `npm run dev`
- **For Netlify functions**: `npm run dev:netlify`

### Issue: Environment variables not loading
**Fix**:
1. Restart dev server
2. Verify `.env.development` file exists
3. Check variable names match (case-sensitive)
4. Don't use quotes in .env file

## Build Issues

### Issue: Build fails with TypeScript errors
**Fix**:
```powershell
npm run build
# Check error messages
# Fix issues in src files
# Rebuild
```

### Issue: Build succeeds but deployment fails
**Steps**:
1. Check Netlify build logs
2. Verify environment variables in Netlify dashboard
3. Check that functions are in `netlify/functions/`
4. Verify `netlify.toml` configuration

## API Key Issues

### Issue: API key errors in console
**Checks**:
1. **Verify API key exists**:
   ```powershell
   # In .env.development
   VITE_OPENROUTER_API_KEY=your_actual_key
   ```

2. **Verify format**:
   - Should start with certain prefix based on provider
   - Should not have quotes in .env file
   - Should not have spaces around `=`

3. **Restart dev server** after changing keys

### Issue: API key working locally but not in production
**Fixes**:
1. Set same key in Netlify environment variables
2. Redeploy after setting variables
3. Wait a few seconds for variables to propagate

## Console Debugging Tips

### View colored logs
Open browser console (F12) and filter by:
- Search for 🎯 to find quiz generation start
- Search for ✅ to find successful operations
- Search for ❌ to find errors
- Search for 🚨 to find critical issues

### Monitor API calls
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "openrouter" or "yoco"
4. Check status codes and response

### Trace errors
1. Error appears in console
2. Click the file reference
3. Check the code around that line
4. Look for console logs before error

## Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Quiz not working | Check API key in .env |
| Payment not working | Verify Yoco key in Netlify |
| Slow responses | Wait, might be API load |
| Environment variables not loading | Restart dev server |
| Port already in use | Use different port or kill process |
| Blank errors | Check browser console with F12 |
| 404 errors | Verify function exists and path is correct |
| 401 errors | Check API key is valid and not expired |

## Getting Help

### Debug Information to Collect
When reporting issues, include:
1. Error message from console
2. Console logs (copy-paste)
3. Environment setup (local/production)
4. Steps to reproduce
5. Browser type and version
6. What was working before

### Resources
- Check `QUIZ_GENERATION_FIX.md` for quiz details
- Check `PAYMENT_FIX.md` for payment details
- Check `DEV_SETUP.md` for environment setup
- Check `FIXES_SUMMARY.md` for overview

## Performance Tuning

### If quiz generation is slow
1. Check which model is being used
2. Try different free model
3. Reduce content size
4. Check OpenRouter API status

### If payment is slow
1. Check network tab in DevTools
2. Verify API key permissions
3. Check Yoco service status
4. Try sandbox environment

## Testing Checklist

Before deployment:
- [ ] Quiz generates in <10 seconds
- [ ] Quiz questions are properly formatted
- [ ] Payment checkout appears without 404
- [ ] Payment can be completed
- [ ] No console errors during flows
- [ ] Environment variables are set correctly
- [ ] Build completes without errors
