import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRCodeDataURL(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const { size = 300, margin = 2, color = {} } = options;

  return QRCode.toDataURL(url, {
    width: size,
    margin,
    color: {
      dark: color.dark || '#000000',
      light: color.light || '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}

export async function generateQRCodeSVG(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const { size = 300, margin = 2, color = {} } = options;

  return QRCode.toString(url, {
    type: 'svg',
    width: size,
    margin,
    color: {
      dark: color.dark || '#000000',
      light: color.light || '#ffffff',
    },
  });
}

export function buildTableQRUrl(restaurantSlug: string, tableCode: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/t/${tableCode}`;
}
