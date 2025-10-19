'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@qr-uploader/ui';
import { QrCode, Upload, Shield, LogIn, FileText, Image as ImageIcon, Video } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
              <QrCode className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              MyDriveQR
            </h1>
            <p className="text-lg text-gray-600">
              Upload files to Google Drive and generate QR codes instantly
            </p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg p-6 shadow-md space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Secure File Upload</h3>
                <p className="text-sm text-gray-600">Upload files directly to your Google Drive</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Instant QR Generation</h3>
                <p className="text-sm text-gray-600">Get QR codes for your uploaded files immediately</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Secure & Private</h3>
                <p className="text-sm text-gray-600">Your files are stored securely in your Google Drive</p>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="pt-4">
            <Button
              onClick={() => signIn('google')}
              size="lg"
              className="w-full"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported File Types:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <Upload className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-xs text-gray-700">Any File</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <FileText className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-xs text-gray-700">Documents</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <ImageIcon className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-xs text-gray-700">Images</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <Video className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-xs text-gray-700">Videos</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-600">
            Developed by <a href="https://github.com/gn027c" className="text-blue-600 hover:underline font-medium">@gn027c</a>
          </p>
        </div>
      </main>
    </div>
  );
}
