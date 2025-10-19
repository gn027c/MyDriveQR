export type QRType = 'TEXT' | 'URL' | 'EMAIL' | 'PHONE' | 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'WIFI' | 'BANK' | 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'LINKEDIN' | 'GITHUB' | 'FILE';

export interface UploadResult {
  file: {
    id: string;
    name: string;
    link: string;
    thumbnail?: string;
  };
  qrCode: string;
  qrCodeId: string;
}

export interface QRHistoryItem {
  id: string;
  type: string;
  content: string;
  qrImage: string;
  fileURL: string | null;
  fileName: string | null;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    image: string | null;
  };
}

export interface GeneratedQR {
  id: string;
  type: QRType;
  content: string;
  qrImage: string;
  fileURL?: string;
  fileName?: string;
  createdAt: string;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface BankData {
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: string;
  description: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface WhatsAppData {
  phone: string;
  message: string;
}

export interface TelegramData {
  username: string;
  message: string;
}

export interface YouTubeData {
  videoId: string;
}

export interface InstagramData {
  username: string;
}

export interface TikTokData {
  username: string;
}

export interface LinkedInData {
  profileUrl: string;
}

export interface GitHubData {
  username: string;
}

export const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    TEXT: 'bg-gray-100 text-gray-800',
    URL: 'bg-blue-100 text-blue-800',
    EMAIL: 'bg-green-100 text-green-800',
    PHONE: 'bg-purple-100 text-purple-800',
    SMS: 'bg-pink-100 text-pink-800',
    WHATSAPP: 'bg-green-100 text-green-800',
    TELEGRAM: 'bg-blue-100 text-blue-800',
    WIFI: 'bg-yellow-100 text-yellow-800',
    BANK: 'bg-red-100 text-red-800',
    YOUTUBE: 'bg-red-100 text-red-800',
    INSTAGRAM: 'bg-pink-100 text-pink-800',
    TIKTOK: 'bg-black text-white',
    LINKEDIN: 'bg-blue-100 text-blue-800',
    GITHUB: 'bg-gray-100 text-gray-800',
    FILE: 'bg-indigo-100 text-indigo-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};