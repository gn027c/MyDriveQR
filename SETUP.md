# 🛠️ Setup Guide - Google Cloud Configuration

Detailed guide for setting up Google OAuth 2.0 and Drive API.

## 📋 Prerequisites

- Google Account (Gmail)
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## 🎯 Step 1: Create Google Cloud Project

### 1.1 Create New Project

```
1. Visit https://console.cloud.google.com/
2. Click "Select a project" dropdown (top bar)
3. Click "NEW PROJECT"
4. Project name: "QR Uploader" (or your choice)
5. Organization: Leave as "No organization"
6. Click "CREATE"
7. Wait for project creation (10-30 seconds)
8. Select your new project from dropdown
```

### 1.2 Enable Billing (Optional)

For free tier usage, billing is NOT required. However, some features may need it:

```
1. Navigation Menu > Billing
2. Link billing account (free $300 credit available)
3. Skip this step if staying on free tier
```

## 🔑 Step 2: Enable Required APIs

### 2.1 Enable Google Drive API

```
1. Navigation Menu > APIs & Services > Library
2. Search: "Google Drive API"
3. Click "Google Drive API"
4. Click "ENABLE"
5. Wait for activation
```

### 2.2 Enable Google+ API (for OAuth profile)

```
1. Still in Library
2. Search: "Google+ API"
3. Click "Google+ API"
4. Click "ENABLE"
```

## 🔐 Step 3: Configure OAuth Consent Screen

### 3.1 Basic Configuration

```
1. Navigation Menu > APIs & Services > OAuth consent screen
2. User Type: Select "External"
3. Click "CREATE"
```

### 3.2 App Information

Fill in the form:

**App Information:**
- App name: `QR Uploader`
- User support email: `your-email@gmail.com`
- App logo: (optional) Upload a logo

**App Domain (Optional):**
- Application home page: `https://your-app.vercel.app`
- Application privacy policy: (skip if personal use)
- Application terms of service: (skip if personal use)

**Authorized Domains:**
- Add: `vercel.app`
- Add: your custom domain (if applicable)

**Developer Contact:**
- Email: `your-email@gmail.com`

Click **SAVE AND CONTINUE**

### 3.3 Scopes Configuration

```
1. Click "ADD OR REMOVE SCOPES"
2. Filter/search for these scopes:
   ✅ .../auth/userinfo.email
   ✅ .../auth/userinfo.profile
   ✅ .../auth/drive.file

3. Check the boxes for these three scopes
4. Click "UPDATE"
5. Verify scopes are listed
6. Click "SAVE AND CONTINUE"
```

**Scope Permissions:**
- `userinfo.email` - See your email address
- `userinfo.profile` - See your personal info
- `drive.file` - View and manage Drive files created by this app

### 3.4 Test Users

Since app is in "Testing" mode, add authorized users:

```
1. Click "+ ADD USERS"
2. Enter email: your-admin-email@gmail.com
3. Add any other test users
4. Click "ADD"
5. Click "SAVE AND CONTINUE"
```

### 3.5 Summary

```
1. Review all settings
2. Click "BACK TO DASHBOARD"
```

⚠️ **Note**: Your app will be in "Testing" mode. This is fine for personal use. To publish for all users, submit for verification (not needed for this project).

## 🔑 Step 4: Create OAuth 2.0 Credentials

### 4.1 Create Credentials

```
1. Navigation Menu > APIs & Services > Credentials
2. Click "+ CREATE CREDENTIALS"
3. Select "OAuth client ID"
```

### 4.2 Configure OAuth Client

**Application type:**
- Select: `Web application`

**Name:**
- Enter: `QR Uploader Web Client`

**Authorized JavaScript origins:**
- Click "+ Add URI"
- Add: `http://localhost:3000`
- Add: `https://your-app.vercel.app`

**Authorized redirect URIs:**
- Click "+ Add URI"
- Add: `http://localhost:3000/api/auth/callback/google`
- Add: `https://your-app.vercel.app/api/auth/callback/google`

⚠️ **Important**: Replace `your-app` with your actual Vercel subdomain!

Click **CREATE**

### 4.3 Save Credentials

A popup will appear with:
- **Client ID**: Looks like `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: Looks like `GOCSPX-xxxxxxxxxxxx`

```
✅ Copy Client ID
✅ Copy Client Secret
✅ Store securely (you'll need these for .env)
```

Click **OK**

## 📁 Step 5: Create Google Drive Folder (Optional)

If you want uploads to go to a specific folder:

### 5.1 Create Folder

```
1. Go to https://drive.google.com
2. Click "+ New" > "Folder"
3. Name: "QR Uploads" (or your choice)
4. Click "CREATE"
```

### 5.2 Get Folder ID

```
1. Open the folder you created
2. Look at the URL:
   https://drive.google.com/drive/folders/ABC123XYZ789
3. Copy the ID after /folders/
   Example: ABC123XYZ789
4. This is your GOOGLE_DRIVE_FOLDER_ID
```

If you skip this, files will upload to Drive root.

## 🔧 Step 6: Configure Environment Variables

### 6.1 Copy Template

```bash
cd QR-Uploader
cp .env.example .env
```

### 6.2 Fill in Values

Edit `.env` with your credentials:

```env
# From Step 4.3
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# Generate new secret
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Your admin email (must match test user from Step 3.4)
ADMIN_EMAIL=your-admin-email@gmail.com

# From Step 5.2 (optional)
GOOGLE_DRIVE_FOLDER_ID=ABC123XYZ789
```

### 6.3 Generate NEXTAUTH_SECRET

**On macOS/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Or use online generator:**
- Visit: https://generate-secret.vercel.app/32

Copy the generated string to `NEXTAUTH_SECRET`

## ✅ Step 7: Verify Setup

### 7.1 Check Configuration

Verify you have:
- [x] Google Cloud Project created
- [x] Drive API enabled
- [x] OAuth consent screen configured
- [x] OAuth 2.0 credentials created
- [x] Test users added
- [x] `.env` file filled with all values

### 7.2 Test Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Open http://localhost:3000

**Test Steps:**
1. Click "Sign in with Google"
2. Should see Google OAuth consent screen
3. Select your admin account
4. Grant permissions (email, profile, Drive)
5. Should redirect to /dashboard
6. Try uploading a file
7. Check your Google Drive for the file
8. Verify QR code generates

### 7.3 Troubleshooting

**"Access Denied" Error:**
- Check `ADMIN_EMAIL` matches Google account
- Verify email is in OAuth test users
- Clear browser cache and cookies

**"Redirect URI Mismatch":**
- Verify exact URL in Google Console
- Include `/api/auth/callback/google` path
- Check http vs https

**"Invalid Client":**
- Check `GOOGLE_CLIENT_ID` is correct
- Verify client ID is from correct project
- Ensure no extra spaces in .env

**Upload Fails:**
- Check Drive API is enabled
- Verify scopes include `drive.file`
- Re-authenticate to grant Drive access

## 🚀 Step 8: Prepare for Production

### 8.1 Production Redirect URIs

When deploying to Vercel, update OAuth credentials:

```
1. Deploy to Vercel first (get your URL)
2. Go to Google Cloud Console
3. APIs & Services > Credentials
4. Edit "QR Uploader Web Client"
5. Add redirect URI:
   https://your-actual-app.vercel.app/api/auth/callback/google
6. Save
```

### 8.2 Production Environment Variables

In Vercel Dashboard, set:
- `GOOGLE_CLIENT_ID` - Same as local
- `GOOGLE_CLIENT_SECRET` - Same as local
- `NEXTAUTH_SECRET` - Generate NEW one for production
- `NEXTAUTH_URL` - Your Vercel URL
- `ADMIN_EMAIL` - Same as local

### 8.3 OAuth Publishing (Optional)

For production app available to all users:

```
1. Google Cloud Console
2. OAuth consent screen
3. Click "PUBLISH APP"
4. Submit for verification (takes 1-2 weeks)
```

⚠️ **Not needed** for personal use with test users!

## 📚 Additional Resources

- **Google Cloud Console**: https://console.cloud.google.com/
- **OAuth 2.0 Setup Guide**: https://support.google.com/cloud/answer/6158849
- **Drive API Docs**: https://developers.google.com/drive/api/guides/about-sdk
- **NextAuth.js Google Provider**: https://next-auth.js.org/providers/google

## 🆘 Getting Help

**Common Issues:**
1. OAuth errors → Check redirect URIs
2. Permission denied → Verify scopes
3. Drive upload fails → Enable Drive API
4. Wrong account → Clear browser data

**Support Channels:**
- Google Cloud Support (free tier has forum support)
- Stack Overflow (tag: google-oauth, google-drive-api)
- NextAuth.js Discussions

---

**✅ Setup Complete!**

You're ready to use QR Uploader locally. See `DEPLOYMENT.md` for deploying to Vercel.
