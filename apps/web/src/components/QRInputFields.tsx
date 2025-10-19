'use client';

import { QRType, EmailData, WifiData, BankData } from '@/lib/types';

interface QRInputFieldsProps {
  qrType: QRType;
  textContent: string;
  setTextContent: (value: string) => void;
  urlContent: string;
  setUrlContent: (value: string) => void;
  emailData: EmailData;
  setEmailData: (data: EmailData) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  wifiData: WifiData;
  setWifiData: (data: WifiData) => void;
  bankData: BankData;
  setBankData: (data: BankData) => void;
  smsData?: { phone: string; message: string };
  setSmsData?: (data: { phone: string; message: string }) => void;
  whatsappData?: { phone: string; message: string };
  setWhatsappData?: (data: { phone: string; message: string }) => void;
  telegramData?: { username: string; message: string };
  setTelegramData?: (data: { username: string; message: string }) => void;
  youtubeData?: { videoId: string };
  setYoutubeData?: (data: { videoId: string }) => void;
  instagramData?: { username: string };
  setInstagramData?: (data: { username: string }) => void;
  tiktokData?: { username: string };
  setTiktokData?: (data: { username: string }) => void;
  linkedinData?: { profileUrl: string };
  setLinkedinData?: (data: { profileUrl: string }) => void;
  githubData?: { username: string };
  setGithubData?: (data: { username: string }) => void;
}

export const QRInputFields: React.FC<QRInputFieldsProps> = ({
  qrType,
  textContent,
  setTextContent,
  urlContent,
  setUrlContent,
  emailData,
  setEmailData,
  phoneNumber,
  setPhoneNumber,
  wifiData,
  setWifiData,
  bankData,
  setBankData,
  smsData = { phone: '', message: '' },
  setSmsData,
  whatsappData = { phone: '', message: '' },
  setWhatsappData,
  telegramData = { username: '', message: '' },
  setTelegramData,
  youtubeData = { videoId: '' },
  setYoutubeData,
  instagramData = { username: '' },
  setInstagramData,
  tiktokData = { username: '' },
  setTiktokData,
  linkedinData = { profileUrl: '' },
  setLinkedinData,
  githubData = { username: '' },
  setGithubData,
}) => {
  switch (qrType) {
    case 'TEXT':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            rows={4}
          />
        </div>
      );

    case 'URL':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
          <input
            type="url"
            value={urlContent}
            onChange={(e) => setUrlContent(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      );

    case 'EMAIL':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={emailData.email}
              onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
              placeholder="example@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject (optional)</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              placeholder="Email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body (optional)</label>
            <textarea
              value={emailData.body}
              onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
              placeholder="Email body"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              rows={3}
            />
          </div>
        </div>
      );

    case 'PHONE':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      );

    case 'SMS':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={smsData.phone}
              onChange={(e) => setSmsData?.({ ...smsData, phone: e.target.value })}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={smsData.message}
              onChange={(e) => setSmsData?.({ ...smsData, message: e.target.value })}
              placeholder="Enter your SMS message"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              rows={3}
            />
          </div>
        </div>
      );

    case 'WHATSAPP':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={whatsappData.phone}
              onChange={(e) => setWhatsappData?.({ ...whatsappData, phone: e.target.value })}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={whatsappData.message}
              onChange={(e) => setWhatsappData?.({ ...whatsappData, message: e.target.value })}
              placeholder="Enter your WhatsApp message"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              rows={3}
            />
          </div>
        </div>
      );

    case 'TELEGRAM':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input
              type="text"
              value={telegramData.username}
              onChange={(e) => setTelegramData?.({ ...telegramData, username: e.target.value })}
              placeholder="@username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={telegramData.message}
              onChange={(e) => setTelegramData?.({ ...telegramData, message: e.target.value })}
              placeholder="Enter your Telegram message"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              rows={3}
            />
          </div>
        </div>
      );

    case 'YOUTUBE':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Video ID or URL</label>
          <input
            type="text"
            value={youtubeData.videoId}
            onChange={(e) => setYoutubeData?.({ videoId: e.target.value })}
            placeholder="dQw4w9WgXcQ or https://youtube.com/watch?v=dQw4w9WgXcQ"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      );

    case 'INSTAGRAM':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Username</label>
          <input
            type="text"
            value={instagramData.username}
            onChange={(e) => setInstagramData?.({ username: e.target.value })}
            placeholder="@username or username"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      );

    case 'TIKTOK':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TikTok Username</label>
          <input
            type="text"
            value={tiktokData.username}
            onChange={(e) => setTiktokData?.({ username: e.target.value })}
            placeholder="@username or username"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      );

    case 'LINKEDIN':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile URL</label>
          <input
            type="url"
            value={linkedinData.profileUrl}
            onChange={(e) => setLinkedinData?.({ profileUrl: e.target.value })}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      );

    case 'GITHUB':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Username</label>
          <input
            type="text"
            value={githubData.username}
            onChange={(e) => setGithubData?.({ username: e.target.value })}
            placeholder="username"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      );

    case 'WIFI':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Network Name (SSID) *</label>
            <input
              type="text"
              value={wifiData.ssid}
              onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
              placeholder="My WiFi Network"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input
              type="text"
              value={wifiData.password}
              onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
              placeholder="WiFi password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
            <select
              value={wifiData.encryption}
              onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hidden"
              checked={wifiData.hidden}
              onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="hidden" className="ml-2 text-sm text-gray-700">Hidden Network</label>
          </div>
        </div>
      );

    case 'BANK':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
            <input
              type="text"
              value={bankData.bankName}
              onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
              placeholder="Bank Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
            <input
              type="text"
              value={bankData.accountNumber}
              onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
              placeholder="1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
            <input
              type="text"
              value={bankData.accountName}
              onChange={(e) => setBankData({ ...bankData, accountName: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (optional)</label>
            <input
              type="text"
              value={bankData.amount}
              onChange={(e) => setBankData({ ...bankData, amount: e.target.value })}
              placeholder="100000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <input
              type="text"
              value={bankData.description}
              onChange={(e) => setBankData({ ...bankData, description: e.target.value })}
              placeholder="Payment description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};