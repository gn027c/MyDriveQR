import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logQRGeneration, logAppError, logInfo } from '@/lib/logger';
import { generateTypedQRCode } from '@qr-uploader/utils';
import { QRType } from '@prisma/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let currentSession: any = null;

  try {
    // Check authentication
    currentSession = await getServerSession(authOptions);

    if (!currentSession || !currentSession.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, content, fileURL, fileName } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type and content' },
        { status: 400 }
      );
    }

    // Validate QR type
    if (!Object.values(QRType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid QR type' },
        { status: 400 }
      );
    }

    // Validate content based on type
    if (typeof content === 'string') {
      if (!content.trim()) {
        return NextResponse.json(
          { error: 'Content cannot be empty' },
          { status: 400 }
        );
      }

      // Check content length (QR codes have practical limits)
      if (content.length > 4296) { // Max characters for QR code with H error correction
        return NextResponse.json(
          { error: 'Content is too long for QR code generation (max 4296 characters)' },
          { status: 400 }
        );
      }

      // Basic URL validation for URL type
      if (type === 'URL') {
        const trimmedContent = content.trim();
        if (!trimmedContent.startsWith('http://') && !trimmedContent.startsWith('https://')) {
          // URL will be auto-corrected by formatURLQR, but let's warn about obviously invalid URLs
          if (!trimmedContent.includes('.') && !trimmedContent.includes('localhost')) {
            return NextResponse.json(
              { error: 'Please enter a valid URL (e.g., https://example.com)' },
              { status: 400 }
            );
          }
        }
      }
    } else if (typeof content === 'object' && content !== null) {
      // Validate object content for specific QR types
      switch (type) {
        case 'EMAIL':
          if (!content.email || !content.email.trim()) {
            return NextResponse.json(
              { error: 'Email address is required for EMAIL QR code' },
              { status: 400 }
            );
          }
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(content.email.trim())) {
            return NextResponse.json(
              { error: 'Please enter a valid email address' },
              { status: 400 }
            );
          }
          break;
        case 'SMS':
        case 'WHATSAPP':
          if (!content.phone || !content.phone.trim()) {
            return NextResponse.json(
              { error: 'Phone number is required for SMS/WhatsApp QR code' },
              { status: 400 }
            );
          }
          if (!content.message || !content.message.trim()) {
            return NextResponse.json(
              { error: 'Message is required for SMS/WhatsApp QR code' },
              { status: 400 }
            );
          }
          break;
        case 'TELEGRAM':
          if (!content.username || !content.username.trim()) {
            return NextResponse.json(
              { error: 'Username is required for Telegram QR code' },
              { status: 400 }
            );
          }
          if (!content.message || !content.message.trim()) {
            return NextResponse.json(
              { error: 'Message is required for Telegram QR code' },
              { status: 400 }
            );
          }
          break;
        case 'YOUTUBE':
          if (!content.videoId || !content.videoId.trim()) {
            return NextResponse.json(
              { error: 'Video ID or URL is required for YouTube QR code' },
              { status: 400 }
            );
          }
          break;
        case 'INSTAGRAM':
        case 'TIKTOK':
        case 'GITHUB':
          if (!content.username || !content.username.trim()) {
            return NextResponse.json(
              { error: `Username is required for ${type} QR code` },
              { status: 400 }
            );
          }
          break;
        case 'LINKEDIN':
          if (!content.profileUrl || !content.profileUrl.trim()) {
            return NextResponse.json(
              { error: 'Profile URL is required for LinkedIn QR code' },
              { status: 400 }
            );
          }
          // Basic LinkedIn URL validation
          const linkedinUrl = content.profileUrl.trim();
          if (!linkedinUrl.startsWith('http://') && !linkedinUrl.startsWith('https://')) {
            return NextResponse.json(
              { error: 'LinkedIn profile URL must start with http:// or https://' },
              { status: 400 }
            );
          }
          if (!linkedinUrl.includes('linkedin.com')) {
            return NextResponse.json(
              { error: 'Please enter a valid LinkedIn profile URL' },
              { status: 400 }
            );
          }
          break;
        case 'WIFI':
          if (!content.ssid || !content.ssid.trim()) {
            return NextResponse.json(
              { error: 'WiFi SSID is required for WiFi QR code' },
              { status: 400 }
            );
          }
          break;
        case 'BANK':
          if (!content.accountNumber || !content.accountNumber.trim()) {
            return NextResponse.json(
              { error: 'Account number is required for Bank QR code' },
              { status: 400 }
            );
          }
          if (!content.accountName || !content.accountName.trim()) {
            return NextResponse.json(
              { error: 'Account name is required for Bank QR code' },
              { status: 400 }
            );
          }
          break;
      }
    }

    // Get request context for logging (simplified for now)
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     request.headers.get('x-client-ip') ||
                     undefined;

    // Log QR generation start
    await logQRGeneration(
      type,
      currentSession.user.email,
      {
        contentLength: typeof content === 'string' ? content.length : JSON.stringify(content).length,
        hasFile: !!fileURL,
        userAgent,
        ipAddress,
      }
    );

    // Generate QR code image
    const qrImage = await generateTypedQRCode(type, content, {
      width: 512,
      errorCorrectionLevel: 'H',
    });

    // Store content as string for database
    const contentString = typeof content === 'string'
      ? content
      : JSON.stringify(content);

    // Save to database
    const qrCode = await prisma.qRCode.create({
      data: {
        type: type as QRType,
        content: contentString,
        qrImage,
        fileURL: fileURL || null,
        fileName: fileName || null,
        userEmail: currentSession.user.email,
      },
    });

    // Log successful QR generation
    await logInfo('QR code saved to database', {
      userEmail: currentSession.user.email,
      action: 'QR_SAVED',
      metadata: {
        qrCodeId: qrCode.id,
        qrType: type,
      },
    });

    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        type: qrCode.type,
        content: qrCode.content,
        qrImage: qrCode.qrImage,
        fileURL: qrCode.fileURL,
        fileName: qrCode.fileName,
        createdAt: qrCode.createdAt,
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);

    // Log error
    await logAppError(error as Error, currentSession?.user?.email);

    return NextResponse.json(
      {
        error: 'Failed to generate QR code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
