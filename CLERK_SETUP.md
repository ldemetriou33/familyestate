# Clerk Authentication Setup

## Quick Setup (5 minutes)

1. **Create Clerk Account:**
   - Go to [clerk.com](https://clerk.com)
   - Sign up for free
   - Create a new application

2. **Get Your Keys:**
   - In Clerk Dashboard → API Keys
   - Copy `Publishable Key` and `Secret Key`

3. **Add Environment Variables:**
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   
   # Edit .env.local and add your keys:
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

4. **Configure Clerk:**
   - In Clerk Dashboard → Paths
   - Set Sign-in path: `/sign-in`
   - Set Sign-up path: `/sign-up`
   - Set After sign-in: `/`
   - Set After sign-up: `/`

5. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

## Features Enabled

✅ **Protected Routes** - All dashboard pages require authentication  
✅ **Sign In Page** - Custom styled with Abbey OS theme  
✅ **Sign Up Page** - Custom styled with Abbey OS theme  
✅ **User Button** - Profile menu in header  
✅ **Auto Redirect** - Unauthenticated users redirected to sign-in  

## Testing

1. Visit `http://localhost:3000`
2. You'll be redirected to `/sign-in`
3. Sign up or sign in
4. Access the dashboard!

## Production

For Vercel deployment:
1. Add environment variables in Vercel Dashboard → Settings → Environment Variables
2. Redeploy

---

**Your financial data is now secure!** 🔒

