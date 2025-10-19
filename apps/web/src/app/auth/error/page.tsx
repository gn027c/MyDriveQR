'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@qr-uploader/ui';
import { AlertCircle, Home } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Truy cập bị từ chối',
          description: 'Email của bạn không có quyền truy cập hệ thống này. Chỉ email được cấu hình trong ADMIN_EMAIL mới có thể đăng nhập.',
        };
      case 'Configuration':
        return {
          title: 'Lỗi cấu hình',
          description: 'ADMIN_EMAIL chưa được cấu hình trong file .env. Vui lòng liên hệ quản trị viên.',
        };
      case 'Verification':
        return {
          title: 'Xác thực thất bại',
          description: 'Không thể xác thực tài khoản Google của bạn. Vui lòng thử lại.',
        };
      default:
        return {
          title: 'Lỗi xác thực',
          description: 'Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.',
        };
    }
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {errorMessage.title}
          </h1>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {errorMessage.description}
          </p>

          <div className="pt-4">
            <Link href="/">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Quay về Trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
