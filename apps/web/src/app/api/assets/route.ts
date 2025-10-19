import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get('pageSize') || `${DEFAULT_PAGE_SIZE}`, 10), 1),
      100,
    );
    const type = searchParams.get('type') || undefined;
    const statusFilter = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: Record<string, any> = {
      userEmail: session.user.email,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { fileURL: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [records, total] = await Promise.all([
      (prisma as any).qRCode.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          content: true,
          qrImage: true,
          fileURL: true,
          fileName: true,
          createdAt: true,
        },
        skip,
        take: pageSize,
      }),
      (prisma as any).qRCode.count({ where }),
    ]);

    let items = records.map((item: any) => ({
      id: item.id,
      type: item.type,
      content: item.content,
      qrImage: item.qrImage,
      fileURL: item.fileURL,
      fileName: item.fileName,
      createdAt: item.createdAt,
      status: item.type === 'FILE' && !item.fileURL ? 'MISSING_FILE' : 'ACTIVE',
    }));

    if (statusFilter) {
      items = items.filter((item: any) => item.status === statusFilter);
    }

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        hasMore: skip + items.length < total,
      },
    });
  } catch (error) {
    console.error('Assets list error:', error);
    return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu mã QR cần xóa' }, { status: 400 });
    }

    const qrCode = await (prisma as any).qRCode.findUnique({
      where: { id },
      select: { id: true, userEmail: true },
    });

    if (!qrCode || qrCode.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Không tìm thấy QR code' }, { status: 404 });
    }

    await (prisma as any).qRCode.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete asset error:', error);
    return NextResponse.json({ error: 'Không thể xóa QR code' }, { status: 500 });
  }
}
