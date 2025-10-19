import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

export type QRType = 'TEXT' | 'URL' | 'EMAIL' | 'PHONE' | 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'WIFI' | 'BANK' | 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'LINKEDIN' | 'GITHUB' | 'FILE';

export interface QREmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface QRWifiData {
  ssid: string;
  password?: string;
  encryption?: 'WEP' | 'WPA' | 'WPA2' | 'nopass';
  hidden?: boolean;
}

export interface QRBankData {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount?: number | string;
  description?: string;
}

export interface QRSmsData {
  phone: string;
  message: string;
}

export interface QRWhatsAppData {
  phone: string;
  message: string;
}

export interface QRTelegramData {
  username: string;
  message: string;
}

export interface QRYouTubeData {
  videoId: string;
}

export interface QRInstagramData {
  username: string;
}

export interface QRTikTokData {
  username: string;
}

export interface QRLinkedInData {
  profileUrl: string;
}

export interface QRGithubData {
  username: string;
}

/**
 * Generate QR code as Data URL (base64 image)
 * @param text - Text or URL to encode
 * @param options - QR code generation options
 */
export async function generateQRCode(
  text: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    const qrOptions = {
      width: options?.width || 400,
      margin: options?.margin || 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#ffffff',
      },
    };

    // Generate as data URL (base64)
    const dataUrl = await QRCode.toDataURL(text, qrOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate QR code as buffer (for saving to file)
 * @param text - Text or URL to encode
 * @param options - QR code generation options
 */
export async function generateQRCodeBuffer(
  text: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  try {
    const qrOptions = {
      width: options?.width || 400,
      margin: options?.margin || 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#ffffff',
      },
    };

    const buffer = await QRCode.toBuffer(text, qrOptions);
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error(
      `Failed to generate QR code buffer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate QR code as SVG string
 * @param text - Text or URL to encode
 * @param options - QR code generation options
 */
export async function generateQRCodeSVG(
  text: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    const qrOptions = {
      width: options?.width || 400,
      margin: options?.margin || 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#ffffff',
      },
    };

    const svg = await QRCode.toString(text, { ...qrOptions, type: 'svg' });
    return svg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error(
      `Failed to generate QR code SVG: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Format email data for QR code
 */
export function formatEmailQR(data: QREmailData): string {
  let mailto = `mailto:${data.email}`;
  const params: string[] = [];
  
  if (data.subject) {
    params.push(`subject=${encodeURIComponent(data.subject)}`);
  }
  if (data.body) {
    params.push(`body=${encodeURIComponent(data.body)}`);
  }
  
  if (params.length > 0) {
    mailto += '?' + params.join('&');
  }
  
  return mailto;
}

/**
 * Format phone number for QR code
 */
export function formatPhoneQR(phone: string): string {
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return `tel:${cleanPhone}`;
}

/**
 * Format WiFi data for QR code
 */
export function formatWifiQR(data: QRWifiData): string {
  const { ssid, password = '', encryption = 'WPA', hidden } = data;
  const hiddenFlag = hidden ? 'true' : 'false';
  const escapedSsid = ssid.replace(/([\\;",:])/g, '\\$1');
  const escapedPassword = password.replace(/([\\;",:])/g, '\\$1');

  // WiFi QR format: WIFI:T:WPA;S:ssid;P:password;H:false;;
  return `WIFI:T:${encryption};S:${escapedSsid};P:${escapedPassword};H:${hiddenFlag};;`;
}

/**
 * Format bank data for QR code (generic format, may need adjustment for specific countries)
 */
export function formatBankQR(data: QRBankData): string {
  const { accountNumber, accountName, bankName, amount, description } = data;
  
  // Simple format - can be adapted for specific banking standards like VietQR
  let bankData = `BANK:${bankName}\nACC:${accountNumber}\nNAME:${accountName}`;
  
  if (amount) {
    bankData += `\nAMOUNT:${amount}`;
  }
  if (description) {
    bankData += `\nDESC:${description}`;
  }
  
  return bankData;
}

/**
 * Format URL ensuring it has a protocol
 */
export function formatURLQR(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Format SMS data for QR code
 */
export function formatSmsQR(data: QRSmsData): string {
  const { phone, message } = data;
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return `SMSTO:${cleanPhone}:${message}`;
}

/**
 * Format WhatsApp data for QR code
 */
export function formatWhatsAppQR(data: QRWhatsAppData): string {
  const { phone, message } = data;
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Format Telegram data for QR code
 */
export function formatTelegramQR(data: QRTelegramData): string {
  const { username, message } = data;
  const cleanUsername = username.replace('@', '');
  const encodedMessage = encodeURIComponent(message);
  return `https://t.me/${cleanUsername}?text=${encodedMessage}`;
}

/**
 * Format YouTube data for QR code
 */
export function formatYouTubeQR(data: QRYouTubeData): string {
  const { videoId } = data;
  // Extract video ID from URL if needed
  const cleanVideoId = extractYouTubeVideoId(videoId);
  return `https://www.youtube.com/watch?v=${cleanVideoId}`;
}

/**
 * Format Instagram data for QR code
 */
export function formatInstagramQR(data: QRInstagramData): string {
  const { username } = data;
  const cleanUsername = username.replace('@', '');
  return `https://instagram.com/${cleanUsername}`;
}

/**
 * Format TikTok data for QR code
 */
export function formatTikTokQR(data: QRTikTokData): string {
  const { username } = data;
  const cleanUsername = username.replace('@', '');
  return `https://tiktok.com/@${cleanUsername}`;
}

/**
 * Format LinkedIn data for QR code
 */
export function formatLinkedInQR(data: QRLinkedInData): string {
  return data.profileUrl;
}

/**
 * Format GitHub data for QR code
 */
export function formatGitHubQR(data: QRGithubData): string {
  return `https://github.com/${data.username}`;
}

/**
 * Extract YouTube video ID from URL or return the ID if already provided
 */
function extractYouTubeVideoId(input: string): string {
  // If it's already a video ID (11 characters, alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // Try to extract from YouTube URL
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = input.match(youtubeRegex);
  return match ? match[1] : input;
}

/**
 * Generate QR code based on type and content
 */
export async function generateTypedQRCode(
  type: QRType,
  content: string | QREmailData | QRWifiData | QRBankData | QRSmsData | QRWhatsAppData | QRTelegramData | QRYouTubeData | QRInstagramData | QRTikTokData | QRLinkedInData | QRGithubData,
  options?: QRCodeOptions
): Promise<string> {
  let qrContent: string;

  switch (type) {
    case 'TEXT':
      qrContent = content as string;
      break;
    case 'URL':
      qrContent = formatURLQR(content as string);
      break;
    case 'EMAIL':
      qrContent = formatEmailQR(content as QREmailData);
      break;
    case 'PHONE':
      qrContent = formatPhoneQR(content as string);
      break;
    case 'SMS':
      qrContent = formatSmsQR(content as QRSmsData);
      break;
    case 'WHATSAPP':
      qrContent = formatWhatsAppQR(content as QRWhatsAppData);
      break;
    case 'TELEGRAM':
      qrContent = formatTelegramQR(content as QRTelegramData);
      break;
    case 'WIFI':
      qrContent = formatWifiQR(content as QRWifiData);
      break;
    case 'BANK':
      qrContent = formatBankQR(content as QRBankData);
      break;
    case 'YOUTUBE':
      qrContent = formatYouTubeQR(content as QRYouTubeData);
      break;
    case 'INSTAGRAM':
      qrContent = formatInstagramQR(content as QRInstagramData);
      break;
    case 'TIKTOK':
      qrContent = formatTikTokQR(content as QRTikTokData);
      break;
    case 'LINKEDIN':
      qrContent = formatLinkedInQR(content as QRLinkedInData);
      break;
    case 'GITHUB':
      qrContent = formatGitHubQR(content as QRGithubData);
      break;
    case 'FILE':
      qrContent = content as string; // Should be a URL to the file
      break;
    default:
      qrContent = content as string;
  }

  return generateQRCode(qrContent, options);
}
