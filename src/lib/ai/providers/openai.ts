import type { MenuParserProvider } from './base';
import type { ExtractedMenuData } from '@/types';

export class OpenAIMenuParser implements MenuParserProvider {
  name = 'openai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractMenuFromImage(imageBase64: string, mimeType: string): Promise<ExtractedMenuData> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the menu items from this image and return a JSON object with this structure:
{
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "name": "Item Name",
          "description": "Description",
          "price": 100,
          "currency": "INR",
          "isVegetarian": true,
          "spiceLevel": "NONE|MILD|MEDIUM|HOT|EXTRA_HOT",
          "variants": [{"name": "Size", "price": 100}],
          "addons": [{"name": "Extra", "price": 20}]
        }
      ]
    }
  ]
}
Return ONLY valid JSON, no markdown.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('No content from OpenAI');

    const parsed = JSON.parse(content);
    return this.normalizeMenuData(parsed);
  }

  async extractMenuFromPDF(_pdfBuffer: Buffer): Promise<ExtractedMenuData> {
    throw new Error('PDF extraction not yet implemented for OpenAI provider. Convert to image first.');
  }

  normalizeMenuData(raw: unknown): ExtractedMenuData {
    const data = raw as ExtractedMenuData;
    return {
      categories: (data.categories || []).map((cat) => ({
        name: cat.name || 'Uncategorized',
        items: (cat.items || []).map((item) => ({
          name: item.name || 'Unknown Item',
          description: item.description,
          price: typeof item.price === 'number' ? item.price : 0,
          currency: item.currency || 'INR',
          isVegetarian: !!item.isVegetarian,
          spiceLevel: item.spiceLevel || 'NONE',
          variants: item.variants || [],
          addons: item.addons || [],
        })),
      })),
    };
  }

  validateMenuData(data: ExtractedMenuData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.categories?.length) errors.push('No categories found');
    data.categories?.forEach((cat, i) => {
      if (!cat.name) errors.push(`Category ${i + 1} has no name`);
      if (!cat.items?.length) errors.push(`Category "${cat.name}" has no items`);
    });
    return { valid: errors.length === 0, errors };
  }
}
