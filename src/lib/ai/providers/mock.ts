import type { MenuParserProvider } from './base';
import type { ExtractedMenuData } from '@/types';

export class MockMenuParser implements MenuParserProvider {
  name = 'mock';

  async extractMenuFromImage(_imageBase64: string, _mimeType: string): Promise<ExtractedMenuData> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2000));
    return this.getMockData();
  }

  async extractMenuFromPDF(_pdfBuffer: Buffer): Promise<ExtractedMenuData> {
    await new Promise((r) => setTimeout(r, 3000));
    return this.getMockData();
  }

  normalizeMenuData(_raw: unknown): ExtractedMenuData {
    return this.getMockData();
  }

  validateMenuData(data: ExtractedMenuData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.categories || data.categories.length === 0) {
      errors.push('No categories found');
    }
    return { valid: errors.length === 0, errors };
  }

  private getMockData(): ExtractedMenuData {
    return {
      categories: [
        {
          name: 'Starters',
          items: [
            {
              name: 'Paneer Tikka',
              description: 'Grilled cottage cheese marinated in aromatic spices, served with mint chutney',
              price: 249,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'MEDIUM',
              variants: [
                { name: 'Half Plate', price: 149 },
                { name: 'Full Plate', price: 249 },
              ],
              addons: [
                { name: 'Extra Chutney', price: 20 },
                { name: 'Extra Spicy', price: 0 },
              ],
            },
            {
              name: 'Chicken Tikka',
              description: 'Tender chicken pieces marinated in yogurt and spices, grilled in tandoor',
              price: 299,
              currency: 'INR',
              isVegetarian: false,
              spiceLevel: 'HOT',
              variants: [
                { name: 'Half Plate', price: 199 },
                { name: 'Full Plate', price: 299 },
              ],
            },
            {
              name: 'Veg Spring Rolls',
              description: 'Crispy rolls filled with mixed vegetables and noodles',
              price: 149,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'MILD',
            },
          ],
        },
        {
          name: 'Main Course',
          items: [
            {
              name: 'Dal Makhani',
              description: 'Black lentils slow-cooked overnight with butter and cream',
              price: 199,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'MILD',
              addons: [{ name: 'Extra Butter', price: 30 }],
            },
            {
              name: 'Butter Chicken',
              description: 'Tender chicken in rich tomato-based creamy sauce',
              price: 349,
              currency: 'INR',
              isVegetarian: false,
              spiceLevel: 'MEDIUM',
              variants: [
                { name: 'Half', price: 229 },
                { name: 'Full', price: 349 },
              ],
            },
            {
              name: 'Palak Paneer',
              description: 'Fresh cottage cheese cubes in smooth spinach gravy',
              price: 249,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'MILD',
            },
          ],
        },
        {
          name: 'Breads',
          items: [
            {
              name: 'Butter Naan',
              description: 'Soft leavened bread baked in tandoor with butter',
              price: 40,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'NONE',
            },
            {
              name: 'Garlic Naan',
              description: 'Naan bread topped with garlic and coriander',
              price: 50,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'NONE',
            },
            {
              name: 'Tandoori Roti',
              description: 'Whole wheat bread baked in clay oven',
              price: 25,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'NONE',
            },
          ],
        },
        {
          name: 'Beverages',
          items: [
            {
              name: 'Mango Lassi',
              description: 'Chilled yogurt drink blended with fresh Alphonso mangoes',
              price: 99,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'NONE',
            },
            {
              name: 'Masala Chai',
              description: 'Traditional spiced Indian tea with milk',
              price: 49,
              currency: 'INR',
              isVegetarian: true,
              spiceLevel: 'NONE',
              variants: [
                { name: 'Regular', price: 49 },
                { name: 'Large', price: 69 },
              ],
            },
          ],
        },
      ],
    };
  }
}
