'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Database, RefreshCw, Search, QrCode, ExternalLink, Trash2, Copy } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@qr-uploader/ui';
import { useAuthRedirect } from '@/lib/auth-hook';
import { useDriveSessionMonitor } from '@/hooks/useDriveSessionMonitor';

interface AssetItem {
  id: string;
  type: string;
  content: string;
  qrImage: string;
  fileURL?: string | null;
  fileName?: string | null;
  createdAt: string;
  status: string;
}

interface AssetsResponse {
  items: AssetItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  MISSING_FILE: 'Thiếu tệp',
  NEED_REFRESH: 'Cần kiểm tra lại',
  DELETED: 'Đã xóa',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  MISSING_FILE: 'bg-red-100 text-red-800',
  NEED_REFRESH: 'bg-yellow-100 text-yellow-800',
  DELETED: 'bg-gray-200 text-gray-700',
};

export default function AssetsPage() {
  const { session, status } = useAuthRedirect();
  useDriveSessionMonitor(!!session);

  const [data, setData] = useState<AssetsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAssets = useCallback(async (options?: { page?: number }) => {
    if (!session) return;

    setIsLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      const nextPage = options?.page ?? 1;
      query.set('page', String(nextPage));

      if (typeFilter !== 'ALL') {
        query.set('type', typeFilter);
      }

      if (statusFilter !== 'ALL') {
        query.set('status', statusFilter);
      }

      if (searchTerm.trim()) {
        query.set('search', searchTerm.trim());
      }

      const response = await fetch(`/api/assets?${query.toString()}`);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Phiên của bạn đã hết hạn. Bạn sẽ được đăng xuất.');
          await signOut({ callbackUrl: '/' });
          return;
        }
        throw new Error('Không thể tải danh sách dữ liệu');
      }

      const rawData = (await response.json()) as AssetsResponse;

      const normalizedItems: AssetItem[] = rawData.items.map((item) => ({
        id: item.id,
        type: item.type,
        content: item.content,
        qrImage: item.qrImage,
        fileURL: item.fileURL ?? null,
        fileName: item.fileName ?? null,
        createdAt: item.createdAt,
        status: item.status || 'ACTIVE',
      }));

      if (normalizedItems.length === 0 && rawData.pagination.total > 0 && nextPage > 1) {
        await fetchAssets({ page: nextPage - 1 });
        return;
      }

      setData({
        items: normalizedItems,
        pagination: rawData.pagination,
      });
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [session, typeFilter, statusFilter, searchTerm]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!session) return;

      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa QR code này?');
      if (!confirmed) {
        return;
      }

      setDeletingId(id);
      setError(null);

      try {
        const response = await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });

        if (response.status === 401) {
          await signOut({ callbackUrl: '/' });
          return;
        }

        if (!response.ok) {
          throw new Error('Không thể xóa QR code');
        }

        await fetchAssets({ page });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể xóa QR code');
      } finally {
        setDeletingId(null);
      }
    },
    [session, fetchAssets, page],
  );

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAssets({ page: 1 });
    }
  }, [status, typeFilter, statusFilter, fetchAssets]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (status === 'authenticated') {
        fetchAssets({ page: 1 });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, status, fetchAssets]);

  const assets = useMemo(() => data?.items ?? [], [data]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Database className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Thư viện dữ liệu</h1>
                <p className="text-sm text-gray-600">Quản lý các QR code và tệp đã tạo</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => fetchAssets({ page })} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-3" variant="bordered">
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="ALL">Tất cả loại</option>
                  <option value="TEXT">Text</option>
                  <option value="URL">URL</option>
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone</option>
                  <option value="SMS">SMS</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="TELEGRAM">Telegram</option>
                  <option value="WIFI">WiFi</option>
                  <option value="BANK">Ngân hàng</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="GITHUB">GitHub</option>
                  <option value="FILE">File</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="NEED_REFRESH">Cần kiểm tra lại</option>
                  <option value="MISSING_FILE">Thiếu tệp</option>
                  <option value="DELETED">Đã xóa</option>
                </select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm kiếm theo nội dung, tiêu đề, tên tệp..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Thống kê nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">Tổng số dữ liệu:</span> {data?.pagination.total ?? 0}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Đang hiển thị:</span> {assets.length}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Trang hiện tại:</span> {data?.pagination.page ?? 1}
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Danh sách dữ liệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}

              {assets.length === 0 && !isLoading ? (
                <p className="text-sm text-gray-600">Chưa có dữ liệu nào phù hợp với bộ lọc hiện tại.</p>
              ) : (
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start">
                        <div className="flex flex-col items-center gap-3 md:w-48 md:items-start">
                          <div className="aspect-square w-40 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                            <img
                              src={asset.qrImage}
                              alt={`QR ${asset.id}`}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          {asset.fileName && (
                            <span className="text-xs text-gray-500">
                              <span className="font-medium text-gray-900">Tên tệp:</span> {asset.fileName}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">QR #{asset.id.slice(0, 8)}</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[asset.status] || 'bg-gray-200 text-gray-700'}`}>
                              {STATUS_LABELS[asset.status] || asset.status}
                            </span>
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {asset.type}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">Nội dung:</span>{' '}
                            <span className="break-words">
                              {asset.content.slice(0, 200)}
                              {asset.content.length > 200 ? '…' : ''}
                            </span>
                          </p>

                          <div className="grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                            <span>
                              <span className="font-medium text-gray-900">Tạo lúc:</span>{' '}
                              {new Date(asset.createdAt).toLocaleString()}
                            </span>
                            {asset.fileURL && (
                              <span className="break-words">
                                <span className="font-medium text-gray-900">Liên kết tệp:</span>{' '}
                                <a
                                  href={asset.fileURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-words text-blue-600 hover:underline"
                                >
                                  {asset.fileURL}
                                </a>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 md:w-48 md:items-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(asset.content)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Sao chép nội dung
                          </Button>
                          {asset.fileURL && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(asset.fileURL ?? '')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Sao chép liên kết
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = asset.qrImage;
                              link.download = `qr-${asset.id}.png`;
                              link.click();
                            }}
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            Tải QR
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(asset.id)}
                            disabled={deletingId === asset.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingId === asset.id ? 'Đang xóa…' : 'Xóa'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">
                  Trang {data?.pagination.page ?? 1} /{' '}
                  {data ? Math.ceil(data.pagination.total / data.pagination.pageSize) : 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fetchAssets({ page: Math.max(1, page - 1) })}
                    disabled={isLoading || page <= 1}
                  >
                    Trang trước
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => fetchAssets({ page: page + 1 })}
                    disabled={isLoading || !data?.pagination.hasMore}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>

              {isLoading && <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
