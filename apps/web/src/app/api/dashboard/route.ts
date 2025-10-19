import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    const [totalQrCodes, fileUploadCount, recentQr, typeBreakdown, recentUploads] = await Promise.all([
      prisma.qRCode.count({ where: { userEmail } }),
      prisma.qRCode.count({ where: { userEmail, type: 'FILE' } }),
      prisma.qRCode.findFirst({ where: { userEmail }, orderBy: { createdAt: 'desc' } }),
      prisma.qRCode.groupBy({
        where: { userEmail },
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
        take: 5,
      }),
      prisma.qRCode.findMany({
        where: { userEmail, type: 'FILE' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totals: {
        qrCodes: totalQrCodes,
        uploads: fileUploadCount,
      },
      recentActivity: recentQr
        ? {
            id: recentQr.id,
            type: recentQr.type,
            createdAt: recentQr.createdAt,
            hasFile: Boolean(recentQr.fileURL),
          }
        : null,
      typeBreakdown: typeBreakdown.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
      recentUploads: recentUploads.map((item) => ({
        id: item.id,
        fileName: item.fileName,
        fileURL: item.fileURL,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard summary' }, { status: 500 });
  }
}
