import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { GoogleDriveService } from '@qr-uploader/utils';
import { generateQRCode } from '@qr-uploader/utils';
import { QRType } from '@prisma/client';

export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Free tier max is 60s

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get access token from session
    const accessToken = (session as any).accessToken;
    const refreshToken = (session as any).refreshToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token available. Please re-authenticate.' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Initialize Google OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Set credentials with access token
    oauth2Client.setCredentials({
      access_token: accessToken,
      ...(refreshToken && { refresh_token: refreshToken }),
    });

    // Upload to Google Drive
    const driveService = new GoogleDriveService(oauth2Client);
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    const uploadResult = await driveService.uploadFile(
      buffer,
      file.name,
      file.type,
      folderId
    );

    // Generate QR code for the shareable link
    const qrCodeDataUrl = await generateQRCode(uploadResult.shareableLink, {
      width: 512,
      errorCorrectionLevel: 'H',
    });

    // Save to database
    const qrCode = await prisma.qRCode.create({
      data: {
        type: QRType.FILE,
        content: uploadResult.shareableLink,
        qrImage: qrCodeDataUrl,
        fileURL: uploadResult.shareableLink,
        fileName: uploadResult.fileName,
        userEmail: session.user.email,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.fileId,
        name: uploadResult.fileName,
        link: uploadResult.shareableLink,
        thumbnail: uploadResult.thumbnailLink,
      },
      qrCode: qrCodeDataUrl,
      qrCodeId: qrCode.id,
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Handle specific Google Drive API errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid Credentials') || error.message.includes('invalid_grant')) {
        return NextResponse.json(
          {
            error: 'Authentication failed. Please sign out and sign in again.',
            details: 'Your Google Drive access has expired or is invalid.'
          },
          { status: 401 }
        );
      }

      if (error.message.includes('insufficientPermissions')) {
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            details: 'Google Drive API access is required for file uploads.'
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
