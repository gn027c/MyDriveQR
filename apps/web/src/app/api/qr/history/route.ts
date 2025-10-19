import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const isAdminUser = isAdmin(session);

    // If admin requests a specific user's data, return that
    // If admin doesn't specify, return all data
    // If regular user, return only their own data
    let qrCodes;

    if (isAdminUser) {
      if (userEmail) {
        // Admin requesting specific user's data
        qrCodes = await prisma.qRCode.findMany({
          where: { userEmail },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                email: true,
                name: true,
                image: true,
              },
            },
          },
        });
      } else {
        // Admin requesting all data
        qrCodes = await prisma.qRCode.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                email: true,
                name: true,
                image: true,
              },
            },
          },
        });
      }
    } else {
      // Regular user - only their own data
      qrCodes = await prisma.qRCode.findMany({
        where: { userEmail: session.user.email },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      qrCodes,
      isAdmin: isAdminUser,
    });
  } catch (error) {
    console.error('QR history error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch QR history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
