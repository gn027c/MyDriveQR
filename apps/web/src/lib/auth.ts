import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { Session } from 'next-auth';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

/**
 * Check if email matches the single admin email
 */
function isAuthorizedEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL is not configured in environment variables');
    return false;
  }
  return email.toLowerCase() === adminEmail.toLowerCase().trim();
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request Drive access
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Check if user has email
      if (!user.email) {
        console.log('Sign-in rejected: No email provided');
        return false;
      }

      // Check if email matches the authorized admin email
      if (!isAuthorizedEmail(user.email)) {
        console.log(`Sign-in rejected: Unauthorized email: ${user.email}`);
        return false;
      }

      try {
        // This user is the admin (only authorized email can login)
        const role = Role.ADMIN;

        // Upsert user in database
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
            role: role,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: role,
          },
        });

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, account }) {
      // Persist OAuth tokens to the JWT token
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Add access token and user role to the session
      if (session && session.user?.email) {
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
        (session as any).error = token.error;

        // Fetch user role from database
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true, id: true },
        });

        if (user) {
          (session as any).user.role = user.role;
          (session as any).user.id = user.id;
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Check if user is admin
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  return (session as any).user.role === Role.ADMIN;
}

/**
 * Get user role from session
 */
export function getUserRole(session: Session | null): Role | null {
  if (!session?.user) return null;
  return (session as any).user.role || null;
}

/**
 * Export helper function for use in other parts of the app
 */
export { isAuthorizedEmail };
