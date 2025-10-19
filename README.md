# QR-Uploader - QR Code Management System

A comprehensive web application for generating and managing multiple types of QR codes with Google Drive integration and authentication.

## Features

### 🎯 Multiple QR Code Types
- **TEXT** - Plain text QR codes
- **URL** - Website links with auto-protocol detection
- **EMAIL** - Email with subject and body
- **PHONE** - Phone numbers in tel: format
- **WIFI** - WiFi network credentials (SSID, password, encryption)
- **BANK** - Bank transfer information
- **FILE** - File upload to Google Drive with auto-QR generation

### 👥 User Management
- Google OAuth authentication
- Role-based access (USER/ADMIN)
- Each user sees their own QR history
- Admin can view all users' QR codes

### 📊 Dashboards
- **User Dashboard** - Upload files, view personal QR history

- **QR Generator** - Dynamic form for all QR types with preview

### 🔒 Security
- NextAuth.js for secure authentication
- Role-based route protection
- PostgreSQL database with Prisma ORM
- Secure Google Drive integration

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + Custom Components
- **QR Generation**: qrcode library
- **File Storage**: Google Drive API
- **Deployment**: Vercel-ready
- **Monorepo**: Turborepo + pnpm workspaces

## Prerequisites

1. **Node.js** >= 18.17.0
2. **pnpm** >= 8.0.0
3. **PostgreSQL** database
4. **Google Cloud Project** with:
   - OAuth 2.0 credentials
   - Google Drive API enabled

## Setup Instructions

### 1. Clone and Install

```bash
cd QR-Uploader
pnpm install
```

### 2. Database Setup

Create a PostgreSQL database and get the connection URL:

```
postgresql://username:password@localhost:5432/qruploader
```

### 3. Google Cloud Setup

#### A. Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret**

#### B. (Optional) Setup Google Drive Folder
1. Create a folder in Google Drive for uploaded files
2. Right-click → Share → Copy folder ID from URL
3. The ID is the last part: `drive.google.com/drive/folders/YOUR_FOLDER_ID`

### 4. Environment Variables

Create `apps/web/.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/qruploader?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Drive (optional for file uploads)
GOOGLE_DRIVE_FOLDER_ID="your-drive-folder-id"

# Admin Email (this user will have ADMIN role)
ADMIN_EMAIL="your-email@gmail.com"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Database Migration

```bash
cd apps/web
pnpm db:push
```

This will create all required tables in your PostgreSQL database.

### 6. Run Development Server

```bash
# From root directory
pnpm dev

# Or from apps/web
cd apps/web
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
QR-Uploader/
├── apps/
│   └── web/                    # Next.js application
│       ├── prisma/
│       │   └── schema.prisma   # Database schema
│       └── src/
│           ├── app/
│           │   ├── api/        # API routes
│           │   ├── admin/      # Admin dashboard
│           │   ├── dashboard/  # User dashboard
│           │   └── generator/  # QR generator
│           └── lib/
│               ├── auth.ts     # NextAuth config
│               └── prisma.ts   # Prisma client
├── packages/
│   ├── ui/                     # Shared UI components
│   └── utils/                  # Shared utilities
│       └── src/
│           ├── qrcode.ts       # QR generation logic
│           └── drive.ts        # Google Drive integration
└── turbo.json                  # Turborepo config
```

## Database Schema

### User Model
- `id` - Unique user ID
- `email` - User email (unique)
- `name` - Display name
- `image` - Profile picture
- `role` - USER or ADMIN
- `createdAt` / `updatedAt` - Timestamps

### QRCode Model
- `id` - Unique QR code ID
- `type` - QR type (TEXT, URL, EMAIL, PHONE, WIFI, BANK, FILE)
- `content` - Raw content (JSON for complex types)
- `qrImage` - Base64 QR image data
- `fileURL` - Google Drive link (for FILE type)
- `fileName` - Original file name
- `userEmail` - Owner's email
- `createdAt` - Creation timestamp

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with Google
- `POST /api/auth/signout` - Sign out

### QR Management
- `POST /api/qr/generate` - Generate new QR code
- `GET /api/qr/history` - Get QR history (user's own or all for admin)
- `POST /api/upload` - Upload file to Google Drive + generate QR

## Usage Guide

### For Regular Users

1. **Sign In** - Use Google account to authenticate
2. **Dashboard** - View your QR history and upload files
3. **Generator** - Create QR codes:
   - Select QR type from dropdown
   - Fill in required fields
   - Click "Generate QR Code"
   - Download or save QR image
4. **File Upload** - Upload files to Google Drive with auto-QR generation

### For Admins

Admin users (email matches `ADMIN_EMAIL` in .env) have additional features:

1. **Admin Panel** - Access via dashboard header
2. **View All QR Codes** - See all users' QR codes
3. **Filter by User** - Dropdown to filter by specific user
4. **Statistics** - Total QR codes, users, most used type

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your Vercel URL
5. Add Vercel URL to Google OAuth authorized redirects
6. Deploy

The `vercel.json` is already configured for deployment.

### Database Hosting

For production, use a PostgreSQL hosting service:
- **Vercel Postgres** (easiest for Vercel deployments)
- **Supabase**
- **Railway**
- **Neon**

Update `DATABASE_URL` with the production database connection string.

## Build Command

```bash
pnpm build
```

This will:
1. Generate Prisma Client
2. Build all packages in the monorepo
3. Build Next.js application

## Scripts Reference

### Root Level
- `pnpm dev` - Start all packages in dev mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages

### App Level (apps/web)
- `pnpm dev` - Start Next.js dev server
- `pnpm build` - Build for production
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio

## Troubleshooting

### Prisma Client Errors
If you see `Cannot find module '@prisma/client'`:
```bash
cd apps/web
pnpm db:generate
```

### OAuth Errors
- Verify redirect URIs in Google Cloud Console
- Check `NEXTAUTH_URL` matches your actual URL
- Ensure Google OAuth consent screen is configured

### Database Connection
- Test PostgreSQL connection with provided URL
- Ensure database exists and is accessible
- Check firewall rules if using remote database

## Contributing

This is a personal project by [@gn027c](https://github.com/gn027c).

## License

Private - All rights reserved.

## Support

For issues or questions, please open an issue on GitHub.
