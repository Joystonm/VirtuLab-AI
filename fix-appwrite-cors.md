# Fix Appwrite CORS Issue

## Problem
Your deployed site at `https://virtulab-ai.appwrite.network/` is getting "failed to fetch" errors because Appwrite doesn't recognize your deployed domain.

## Solution Steps

### 1. Configure Appwrite Console
1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Select your VirtuLab project (ID: `68de6ea10017532e1685`)
3. Navigate to **Settings** → **Platforms**
4. Click **Add Platform** → **Web App**
5. Add these domains:
   - `virtulab-ai.appwrite.network`
   - `https://virtulab-ai.appwrite.network`
   - `*.appwrite.network` (if you want to allow all subdomains)

### 2. Check Environment Variables
Make sure your deployed site has access to these environment variables:
```
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68de6ea10017532e1685
```

### 3. Test the Fix
After adding the platform:
1. Clear your browser cache
2. Try logging in again on the deployed site
3. Check browser console for any remaining errors

### 4. Alternative Quick Fix
If the above doesn't work immediately, try adding these additional domains:
- `localhost:3000` (for development)
- `localhost:5173` (for Vite dev server)
- Your actual deployment URL

## Verification
Once fixed, you should see these console messages:
- ✅ Appwrite connection successful
- ✅ User authenticated: [email]

## Common Issues
- **Still getting CORS errors**: Wait 5-10 minutes for Appwrite changes to propagate
- **Environment variables not found**: Check your deployment platform's environment variable settings
- **Different error messages**: Check the browser's Network tab for more specific error details
