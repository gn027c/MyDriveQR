import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = (session as any).accessToken;
    const refreshToken = (session as any).refreshToken;

    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      ...(refreshToken && { refresh_token: refreshToken }),
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    await drive.files.list({ pageSize: 1, fields: 'files(id)', orderBy: 'modifiedTime desc' });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Drive ping error:', error);

    if (error instanceof Error) {
      const message = error.message || '';
      if (message.includes('Invalid Credentials') || message.includes('invalid_grant')) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }

      if (message.includes('insufficientPermissions')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Drive ping failed' }, { status: 500 });
  }
}
