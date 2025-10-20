'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { Upload, FileText, QrCode, LinkIcon, RefreshCw } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, FileUpload } from '@qr-uploader/ui';
import { useAuthRedirect } from '@/lib/auth-hook';

interface UploadResult {
  file: {
    id: string;
    name: string;
    link: string;
    thumbnail?: string | null;
  };
  qrCode: string;
  qrCodeId: string;
}

export default function UploadsPage() {
  const { session, status } = useAuthRedirect();

  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 * 1024;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn một tệp để tải lên');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const data = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');
        xhr.responseType = 'text';

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(Math.min(99, percent));
          } else {
            setProgress((prev) => {
              if (prev === null || prev < 10) return 10;
              return Math.min(95, prev + 5);
            });
          }
        };

        xhr.onload = () => {
          const responseText = xhr.responseText || '';
          const status = xhr.status;
          if (status >= 200 && status < 300) {
            try {
              const parsed = JSON.parse(responseText) as UploadResult;
              resolve(parsed);
            } catch (parseError) {
              const error = new Error('Không thể đọc phản hồi tải lên') as Error & { status?: number };
              error.status = status;
              reject(error);
            }
          } else {
            try {
              const errorPayload = JSON.parse(responseText);
              const error = new Error(errorPayload.error || 'Không thể tải lên tệp') as Error & { status?: number };
              error.status = status;
              reject(error);
            } catch (errorParse) {
              const error = new Error('Không thể tải lên tệp') as Error & { status?: number };
              error.status = status;
              reject(error);
            }
          }
        };

        xhr.onerror = () => {
          const error = new Error('Không thể tải lên tệp') as Error & { status?: number };
          error.status = xhr.status || 0;
          reject(error);
        };

        xhr.send(formData);
      });

      setResult(data);
      setSelectedFile(null);
      setProgress(100);
    } catch (err) {
      const status = (err as any)?.status as number | undefined;
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải lên tệp';
      const isAuthFailure = status === 401 || message.includes('Authentication failed');

      if (isAuthFailure) {
        setError('Phiên Google Drive đã hết hạn. Bạn sẽ được đăng xuất.');
        await signOut({ callbackUrl: '/' });
        return;
      }

      setError(message);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(null);
      }, 400);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(null);
  };

  const handleDownloadQR = () => {
    if (!result?.qrCode) return;
    const link = document.createElement('a');
    link.href = result.qrCode;
    link.download = `drive-qr-${Date.now()}.png`;
    link.click();
  };

  const handleCopyLink = async () => {
    if (!result?.file.link) return;
    try {
      await navigator.clipboard.writeText(result.file.link);
      setError(null);
    } catch (clipboardError) {
      setError('Không thể sao chép liên kết. Vui lòng thử lại.');
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
                <Upload className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tải lên & Tạo QR</h1>
                <p className="text-sm text-gray-600">Upload file lên Google Drive và nhận QR code chia sẻ ngay lập tức</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-6 lg:grid-cols-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Chọn tệp của bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <FileUpload onFileSelect={handleFileSelect} maxSize={MAX_FILE_SIZE_BYTES} />

              {selectedFile && (
                <div className="p-3 rounded-lg border border-gray-200 bg-white">
                  <p className="text-sm font-medium text-gray-900">Tệp đã chọn:</p>
                  <p className="text-sm text-gray-600 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">Dung lượng: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              )}

              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${progress ?? 0}%` }}
                  ></div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Đang tải lên... {progress !== null ? `${progress}%` : ''}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleUpload} disabled={!selectedFile} isLoading={isUploading} className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên & Tạo QR
                </Button>
                <Button variant="secondary" onClick={handleReset} disabled={!selectedFile && !result}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Làm mới
                </Button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </CardContent>
          </Card>

          <Card variant={result ? 'elevated' : 'bordered'}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="mr-2 h-5 w-5 text-blue-600" />
                QR code của bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <Image
                        src={result.qrCode}
                        alt="QR code"
                        width={256}
                        height={256}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Tên tệp:</span>
                      <span className="text-gray-600 truncate max-w-[60%]" title={result.file.name}>
                        {result.file.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Liên kết chia sẻ:</span>
                      <Button size="sm" variant="secondary" onClick={handleCopyLink}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Sao chép
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleDownloadQR}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Tải QR
                    </Button>
                    <Button variant="secondary" onClick={handleReset}>
                      Tạo mới
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  Sau khi tải lên thành công, mã QR của bạn sẽ xuất hiện tại đây.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
