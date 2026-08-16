import type { ExtractedMenuData } from '@/types';

export interface MenuParserProvider {
  name: string;
  extractMenuFromImage(imageBase64: string, mimeType: string): Promise<ExtractedMenuData>;
  extractMenuFromPDF(pdfBuffer: Buffer): Promise<ExtractedMenuData>;
  normalizeMenuData(raw: unknown): ExtractedMenuData;
  validateMenuData(data: ExtractedMenuData): { valid: boolean; errors: string[] };
}
