'use client';

import { useState } from 'react';
import { QrCode, Download, Plus } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@qr-uploader/ui';
import { useAuthRedirect } from '@/lib/auth-hook';
import { QRInputFields } from '@/components/QRInputFields';
import { QRType, GeneratedQR } from '@/lib/types';

const QR_CATEGORIES = {
  Basic: ['TEXT', 'URL', 'PHONE'],
  Social: ['EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM'],
  Media: ['YOUTUBE', 'INSTAGRAM', 'TIKTOK'],
  Professional: ['LINKEDIN', 'GITHUB'],
  Network: ['WIFI'],
  Payment: ['BANK'],
} as const;

type CategoryKey = keyof typeof QR_CATEGORIES;

export default function DashboardPage() {
  const { session, status } = useAuthRedirect();

  const [activeCategory, setActiveCategory] = useState<CategoryKey>('Basic');
  const [selectedType, setSelectedType] = useState<QRType>('TEXT');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [emailData, setEmailData] = useState({ email: '', subject: '', body: '' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsData, setSmsData] = useState({ phone: '', message: '' });
  const [whatsappData, setWhatsappData] = useState({ phone: '', message: '' });
  const [telegramData, setTelegramData] = useState({ username: '', message: '' });
  const [youtubeData, setYoutubeData] = useState({ videoId: '' });
  const [instagramData, setInstagramData] = useState({ username: '' });
  const [tiktokData, setTiktokData] = useState({ username: '' });
  const [linkedinData, setLinkedinData] = useState({ profileUrl: '' });
  const [githubData, setGithubData] = useState({ username: '' });
  const [wifiData, setWifiData] = useState({
    ssid: '',
    password: '',
    encryption: 'WPA' as 'WPA' | 'WEP' | 'nopass',
    hidden: false,
  });
  const [bankData, setBankData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: '',
    description: '',
  });

  const handleGenerateQR = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedQR(null);

    try {
      let content: any;

      switch (selectedType) {
        case 'TEXT':
          if (!textContent.trim()) {
            throw new Error('Vui lòng nhập nội dung văn bản');
          }
          if (textContent.length > 4296) {
            throw new Error('Nội dung quá dài (tối đa 4296 ký tự)');
          }
          content = textContent;
          break;
        case 'URL':
          if (!urlContent.trim()) {
            throw new Error('Vui lòng nhập URL');
          }
          content = urlContent.trim();
          break;
        case 'EMAIL':
          if (!emailData.email.trim()) {
            throw new Error('Vui lòng nhập địa chỉ email');
          }
          content = emailData;
          break;
        case 'PHONE':
          if (!phoneNumber.trim()) {
            throw new Error('Vui lòng nhập số điện thoại');
          }
          content = phoneNumber;
          break;
        case 'SMS':
        case 'WHATSAPP':
          if (!smsData.phone.trim() || !smsData.message.trim()) {
            throw new Error('Vui lòng nhập số điện thoại và tin nhắn');
          }
          content = smsData;
          break;
        case 'TELEGRAM':
          if (!telegramData.username.trim() || !telegramData.message.trim()) {
            throw new Error('Vui lòng nhập username và tin nhắn');
          }
          content = telegramData;
          break;
        case 'YOUTUBE':
          if (!youtubeData.videoId.trim()) {
            throw new Error('Vui lòng nhập ID hoặc URL video YouTube');
          }
          content = youtubeData;
          break;
        case 'INSTAGRAM':
          if (!instagramData.username.trim()) {
            throw new Error('Vui lòng nhập username Instagram');
          }
          content = instagramData;
          break;
        case 'TIKTOK':
          if (!tiktokData.username.trim()) {
            throw new Error('Vui lòng nhập username TikTok');
          }
          content = tiktokData;
          break;
        case 'LINKEDIN':
          if (!linkedinData.profileUrl.trim()) {
            throw new Error('Vui lòng nhập đường dẫn LinkedIn');
          }
          content = linkedinData;
          break;
        case 'GITHUB':
          if (!githubData.username.trim()) {
            throw new Error('Vui lòng nhập username GitHub');
          }
          content = githubData;
          break;
        case 'WIFI':
          if (!wifiData.ssid.trim()) {
            throw new Error('Vui lòng nhập tên mạng WiFi');
          }
          content = wifiData;
          break;
        case 'BANK':
          if (!bankData.accountNumber.trim() || !bankData.accountName.trim()) {
            throw new Error('Vui lòng nhập số tài khoản và tên chủ tài khoản');
          }
          content = bankData;
          break;
        case 'FILE':
          setError('Hãy sử dụng trang Upload để tải file và tạo QR');
          return;
        default:
          throw new Error('Loại QR chưa được hỗ trợ');
      }

      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo QR code');
      }

      const data = await response.json();
      setGeneratedQR(data.qrCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (qrImage: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr-${fileName || Date.now()}.png`;
    link.click();
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
                <QrCode className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển</h1>
                <p className="text-sm text-gray-600">{session.user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Trình tạo QR</h2>
            <p className="text-sm text-gray-600">Chọn loại QR và nhập nội dung phù hợp để tạo mã QR của bạn</p>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {(Object.keys(QR_CATEGORIES) as CategoryKey[]).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QR_CATEGORIES[activeCategory].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as QRType)}
                    className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                      selectedType === type
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Tạo QR {selectedType}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QRInputFields
                qrType={selectedType}
                textContent={textContent}
                setTextContent={setTextContent}
                urlContent={urlContent}
                setUrlContent={setUrlContent}
                emailData={emailData}
                setEmailData={setEmailData}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                smsData={smsData}
                setSmsData={setSmsData}
                whatsappData={whatsappData}
                setWhatsappData={setWhatsappData}
                telegramData={telegramData}
                setTelegramData={setTelegramData}
                youtubeData={youtubeData}
                setYoutubeData={setYoutubeData}
                instagramData={instagramData}
                setInstagramData={setInstagramData}
                tiktokData={tiktokData}
                setTiktokData={setTiktokData}
                linkedinData={linkedinData}
                setLinkedinData={setLinkedinData}
                githubData={githubData}
                setGithubData={setGithubData}
                wifiData={wifiData}
                setWifiData={setWifiData}
                bankData={bankData}
                setBankData={setBankData}
              />

              <div className="flex gap-2">
                <Button onClick={handleGenerateQR} disabled={isGenerating} className="flex-1">
                  {isGenerating ? 'Đang tạo QR...' : 'Tạo QR code'}
                </Button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card variant={generatedQR ? 'elevated' : 'bordered'}>
            <CardHeader>
              <CardTitle>Kết quả</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedQR ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img
                        src={generatedQR.qrImage}
                        alt="QR code"
                        width={256}
                        height={256}
                        className="rounded"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => handleDownload(generatedQR.qrImage, generatedQR.fileName || generatedQR.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Tải QR
                    </Button>
                    <Button variant="secondary" onClick={() => setGeneratedQR(null)}>
                      Tạo mới
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  QR code của bạn sẽ hiển thị tại đây sau khi tạo thành công.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
