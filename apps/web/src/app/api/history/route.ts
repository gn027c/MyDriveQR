import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch logs for the current user
    const logs = await prisma.log.findMany({
      where: {
        userEmail: session.user.email,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Transform logs into activity items
    const activities = logs.map((log: any) => {
      let title = '';
      let description = log.message;
      let type: 'QR_GENERATED' | 'FILE_UPLOADED' | 'ERROR' = 'ERROR';

      // Determine activity type and format based on action
      if (log.action === 'QR_GENERATED') {
        type = 'QR_GENERATED';
        title = 'QR Code Generated';
        const qrType = log.metadata?.qrType || 'Unknown';
        description = `Generated ${qrType} QR code`;
      } else if (log.action === 'FILE_UPLOADED') {
        type = 'FILE_UPLOADED';
        title = 'File Uploaded';
        const fileName = (log.metadata as any)?.fileName || 'Unknown file';
        description = `Uploaded ${fileName} to Google Drive`;
      } else if (log.level === 'ERROR' || log.level === 'FATAL') {
        type = 'ERROR';
        title = 'Error Occurred';
        description = log.message;
      } else {
        title = 'System Activity';
        description = log.message;
      }

      return {
        id: log.id,
        type,
        title,
        description,
        timestamp: log.createdAt.toISOString(),
        metadata: log.metadata,
      };
    });

    return NextResponse.json({
      activities,
      total: activities.length,
      hasMore: activities.length === limit,
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch activity history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
