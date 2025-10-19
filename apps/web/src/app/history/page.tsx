'use client';

import { useEffect, useMemo, useState } from 'react';
import { History, QrCode, Upload, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@qr-uploader/ui';
import { useAuthRedirect } from '@/lib/auth-hook';

interface ActivityItem {
  id: string;
  type: 'QR_GENERATED' | 'FILE_UPLOADED' | 'ERROR' | string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
}

interface HistoryResponse {
  activities: ActivityItem[];
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

const TYPE_FILTERS: { label: string; value: ActivityItem['type'] | 'ALL'; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { label: 'Tất cả', value: 'ALL', icon: History, color: 'text-gray-600' },
  { label: 'QR Codes', value: 'QR_GENERATED', icon: QrCode, color: 'text-blue-600' },
  { label: 'Uploads', value: 'FILE_UPLOADED', icon: Upload, color: 'text-green-600' },
  { label: 'Lỗi', value: 'ERROR', icon: AlertTriangle, color: 'text-red-600' },
];

export default function HistoryPage() {
  const { session, status } = useAuthRedirect();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [typeFilter, setTypeFilter] = useState<typeof TYPE_FILTERS[number]['value']>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadActivities = async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const nextOffset = reset ? 0 : offset;

    try {
      const response = await fetch(`/api/history?limit=${PAGE_SIZE}&offset=${nextOffset}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Không thể tải lịch sử' }));
        throw new Error(errorData.error || 'Không thể tải lịch sử');
      }

      const data = (await response.json()) as HistoryResponse;

      setActivities((prev) => (reset ? data.activities : [...prev, ...data.activities]));
      setHasMore(data.hasMore);
      setOffset(nextOffset + PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadActivities(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesType =
        typeFilter === 'ALL' ? true : activity.type === typeFilter || (typeFilter === 'ERROR' && activity.type !== 'QR_GENERATED' && activity.type !== 'FILE_UPLOADED');
      const matchesSearch = searchTerm
        ? `${activity.title} ${activity.description}`.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesType && matchesSearch;
    });
  }, [activities, typeFilter, searchTerm]);

  const renderTypeIcon = (activityType: ActivityItem['type']) => {
    switch (activityType) {
      case 'QR_GENERATED':
        return <QrCode className="h-5 w-5 text-blue-600" />;
      case 'FILE_UPLOADED':
        return <Upload className="h-5 w-5 text-green-600" />;
      case 'ERROR':
      default:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

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
                <History className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nhật ký hoạt động</h1>
                <p className="text-sm text-gray-600">Theo dõi lịch sử tạo QR và tải lên của bạn</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => loadActivities(true)} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3" variant="bordered">
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {TYPE_FILTERS.map(({ label, value, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setTypeFilter(value)}
                    className={`flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      typeFilter === value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mô tả..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2" variant="bordered">
            <CardHeader>
              <CardTitle>Tổng quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">Tổng số hoạt động:</span> {activities.length}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Hoạt động gần nhất:</span>{' '}
                {activities.length > 0 ? new Date(activities[0].timestamp).toLocaleString() : 'Chưa có dữ liệu'}
              </p>
              <p className="text-xs text-gray-400">Hiển thị tối đa {offset} mục đã tải. Sử dụng "Tải thêm" để xem nhiều hơn.</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}

              {filteredActivities.length === 0 && !isLoading ? (
                <p className="text-sm text-gray-600">Chưa có hoạt động nào phù hợp với bộ lọc hiện tại.</p>
              ) : (
                <div className="space-y-3">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="mt-1">
                        {renderTypeIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{activity.title}</h3>
                          <span className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        {activity.metadata && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-medium text-blue-600">Chi tiết</summary>
                            <pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs text-gray-700">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">Đã tải {filteredActivities.length} / {activities.length} hoạt động</span>
                <div className="flex gap-2">
                  {hasMore && (
                    <Button size="sm" onClick={() => loadActivities(false)} disabled={isLoading}>
                      Tải thêm
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => loadActivities(true)} disabled={isLoading}>
                    Làm mới danh sách
                  </Button>
                </div>
              </div>

              {isLoading && (
                <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
