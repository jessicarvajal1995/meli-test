#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';

interface ProductPrice {
  amount: number;
  currency: string;
  originalAmount?: number;
}

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: ProductPrice;
  categoryId: string;
  status: 'active' | 'inactive' | 'pending' | 'discontinued';
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryPath {
  id: string;
  name: string;
}

interface CategoryData {
  id: string;
  name: string;
  path: CategoryPath[];
  parentId?: string;
}

class DataGenerator {
  private readonly dataDir = path.join(process.cwd(), 'data');
  
  private readonly brands = [
    'Apple', 'Samsung', 'Sony', 'LG', 'HP', 'Dell', 'Lenovo', 'Asus', 
    'Xiaomi', 'Huawei', 'OnePlus', 'Google', 'Microsoft', 'Nintendo', 
    'PlayStation', 'Xbox', 'Canon', 'Nikon', 'JBL', 'Bose'
  ];

  private readonly productTemplates = {
    'CAT_ELECTRONICS_PHONES': {
      titles: [
        'iPhone 15 Pro Max {storage}GB {color}',
        'Samsung Galaxy S24 Ultra {storage}GB {color}',
        'Xiaomi 14 Pro {storage}GB {color}',
        'Google Pixel 8 Pro {storage}GB {color}',
        'OnePlus 12 {storage}GB {color}'
      ],
      storages: ['128', '256', '512', '1TB'],
      colors: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Titanio Natural', 'Dorado'],
      basePrice: { min: 300, max: 1500 }
    },
    'CAT_ELECTRONICS_LAPTOPS': {
      titles: [
        'MacBook Pro {size}" M3 {storage}GB {color}',
        'Dell XPS {size}" Intel i7 {storage}GB',
        'HP Pavilion {size}" AMD Ryzen 7 {storage}GB',
        'Lenovo ThinkPad {size}" Intel i5 {storage}GB',
        'Asus ROG {size}" Gaming {storage}GB'
      ],
      sizes: ['13', '14', '15', '16', '17'],
      storages: ['256GB', '512GB', '1TB', '2TB'],
      colors: ['Gris Espacial', 'Plata', 'Negro', 'Blanco'],
      basePrice: { min: 800, max: 3000 }
    },
    'CAT_ELECTRONICS_AUDIO': {
      titles: [
        'Auriculares {brand} {model} {type}',
        'Parlante {brand} {model} Bluetooth',
        'Audífonos {brand} {model} {type}',
        'Soundbar {brand} {model} {power}W'
      ],
      models: ['Pro', 'Max', 'Ultra', 'Studio', 'Elite', 'Premium'],
      types: ['Inalámbricos', 'Con Cable', 'Noise Cancelling', 'Gaming'],
      powers: ['50', '100', '150', '200', '300'],
      basePrice: { min: 50, max: 500 }
    }
  };

  async generateData(productCount: number = 100): Promise<void> {
    console.log(`🚀 Generating dataset with ${productCount} products...`);
    
    await fs.mkdir(this.dataDir, { recursive: true });

    const categories = this.generateCategories();
    const products = this.generateProducts(productCount, categories);

    await this.saveData('categories.json', categories);
    await this.saveData('products.json', products);

    console.log(`✅ Dataset generated successfully!`);
    console.log(`📊 Generated: ${categories.length} categories, ${products.length} products`);
  }

  async cleanData(): Promise<void> {
    const files = ['products.json', 'categories.json'];
    
    for (const file of files) {
      const filePath = path.join(this.dataDir, file);
      await fs.writeFile(filePath, '[]', 'utf-8');
    }
    
    console.log('🧹 Data cleaned - all files reset to empty arrays');
  }

  private generateCategories(): CategoryData[] {
    return [
      {
        id: "CAT_ELECTRONICS",
        name: "Electrónicos",
        path: [{ id: "CAT_ELECTRONICS", name: "Electrónicos" }]
      },
      {
        id: "CAT_ELECTRONICS_PHONES",
        name: "Celulares y Smartphones",
        path: [
          { id: "CAT_ELECTRONICS", name: "Electrónicos" },
          { id: "CAT_ELECTRONICS_PHONES", name: "Celulares y Smartphones" }
        ],
        parentId: "CAT_ELECTRONICS"
      },
      {
        id: "CAT_ELECTRONICS_LAPTOPS",
        name: "Computadoras y Laptops",
        path: [
          { id: "CAT_ELECTRONICS", name: "Electrónicos" },
          { id: "CAT_ELECTRONICS_LAPTOPS", name: "Computadoras y Laptops" }
        ],
        parentId: "CAT_ELECTRONICS"
      },
      {
        id: "CAT_ELECTRONICS_AUDIO",
        name: "Audio y Sonido",
        path: [
          { id: "CAT_ELECTRONICS", name: "Electrónicos" },
          { id: "CAT_ELECTRONICS_AUDIO", name: "Audio y Sonido" }
        ],
        parentId: "CAT_ELECTRONICS"
      },
      {
        id: "CAT_ELECTRONICS_GAMING",
        name: "Videojuegos y Consolas",
        path: [
          { id: "CAT_ELECTRONICS", name: "Electrónicos" },
          { id: "CAT_ELECTRONICS_GAMING", name: "Videojuegos y Consolas" }
        ],
        parentId: "CAT_ELECTRONICS"
      },
      {
        id: "CAT_ELECTRONICS_TV",
        name: "TV y Video",
        path: [
          { id: "CAT_ELECTRONICS", name: "Electrónicos" },
          { id: "CAT_ELECTRONICS_TV", name: "TV y Video" }
        ],
        parentId: "CAT_ELECTRONICS"
      },
      {
        id: "CAT_HOME",
        name: "Casa y Jardín",
        path: [{ id: "CAT_HOME", name: "Casa y Jardín" }]
      },
      {
        id: "CAT_FASHION",
        name: "Ropa y Accesorios",
        path: [{ id: "CAT_FASHION", name: "Ropa y Accesorios" }]
      },
      {
        id: "CAT_SPORTS",
        name: "Deportes y Fitness",
        path: [{ id: "CAT_SPORTS", name: "Deportes y Fitness" }]
      }
    ];
  }

  private generateProducts(count: number, categories: CategoryData[]): ProductData[] {
    const products: ProductData[] = [];
    const productCategories = categories.filter(cat => cat.parentId); 
    const validStatuses: ProductData['status'][] = ['active', 'inactive', 'pending', 'discontinued'];
    
    for (let i = 1; i <= count; i++) {
      const category = this.randomChoice(productCategories);
      const createdDate = this.randomDate(2023, 2024);
      
      products.push({
        id: `MLU${this.randomInt(100000000, 999999999)}`,
        title: this.generateProductTitle(category.id),
        description: this.generateProductDescription(category.id),
        price: this.generatePrice(category.id),
        categoryId: category.id,
        status: this.randomChoice(validStatuses),
        availableQuantity: this.randomInt(0, 50),
        createdAt: createdDate,
        updatedAt: this.randomDateAfter(createdDate)
      });
    }

    return products;
  }

  private generateProductTitle(categoryId: string): string {
    const template = this.productTemplates[categoryId as keyof typeof this.productTemplates];
    if (!template) {
      return `Producto ${this.randomChoice(this.brands)} ${this.randomInt(1000, 9999)}`;
    }

    let title = this.randomChoice(template.titles);
    const brand = this.randomChoice(this.brands);
    
    title = title.replace('{brand}', brand);
    
    if ('storages' in template && template.storages) {
      title = title.replace('{storage}', this.randomChoice(template.storages));
    }
    if ('colors' in template && template.colors) {
      title = title.replace('{color}', this.randomChoice(template.colors));
    }
    if ('sizes' in template && template.sizes) {
      title = title.replace('{size}', this.randomChoice(template.sizes));
    }
    if ('models' in template && template.models) {
      title = title.replace('{model}', this.randomChoice(template.models));
    }
    if ('types' in template && template.types) {
      title = title.replace('{type}', this.randomChoice(template.types));
    }
    if ('powers' in template && template.powers) {
      title = title.replace('{power}', this.randomChoice(template.powers));
    }

    return title;
  }

  private generateProductDescription(categoryId: string): string {
    const descriptions = [
      "Producto de alta calidad con tecnología de punta. Incluye garantía oficial del fabricante.",
      "Excelente relación calidad-precio. Ideal para uso profesional y personal.",
      "Diseño moderno y funcionalidad excepcional. Compatible con los últimos estándares.",
      "Tecnología avanzada con características premium. Fácil de usar y configurar.",
      "Producto confiable con excelente rendimiento. Recomendado por expertos."
    ];
    
    return this.randomChoice(descriptions);
  }

  private generatePrice(categoryId: string): ProductPrice {
    const template = this.productTemplates[categoryId as keyof typeof this.productTemplates];
    const basePrice = template?.basePrice || { min: 50, max: 500 };
    
    const amount = this.randomFloat(basePrice.min, basePrice.max, 2);
    const hasDiscount = Math.random() > 0.7;
    
    return {
      amount,
      currency: 'USD',
      ...(hasDiscount && { originalAmount: this.randomFloat(amount * 1.1, amount * 1.5, 2) })
    };
  }

  private async saveData(filename: string, data: any[]): Promise<void> {
    const filePath = path.join(this.dataDir, filename);
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  }

  private randomDate(startYear: number, endYear: number): string {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
  }

  private randomDateAfter(dateString: string): string {
    const baseDate = new Date(dateString);
    const futureDate = new Date(baseDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
    return futureDate.toISOString();
  }
}

async function main() {
  const command = process.argv[2];
  
  if (!command || !['generate', 'clean'].includes(command)) {
    console.error('❌ Usage: tsx scripts/data-generator.ts <generate|clean> [productCount]');
    console.log('\nCommands:');
    console.log('  generate [count] - Generate dataset with specified product count (default: 100)');
    console.log('  clean           - Clean all data files (reset to empty)');
    process.exit(1);
  }

  const generator = new DataGenerator();
  
  try {
    if (command === 'clean') {
      await generator.cleanData();
    } else if (command === 'generate') {
      const productCount = parseInt(process.argv[3]) || 100;
      await generator.generateData(productCount);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DataGenerator };
