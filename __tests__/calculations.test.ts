import { CartItem, Product, ProductFilters } from '../src/types';
import {
  calculateCartTotals,
  calculateDiscountedPrice,
  filterAndSortProducts,
  findSimilarProducts,
} from '../src/utils/calculations';

const mockProducts: Product[] = [
  {
    id: 1,
    title: 'iPhone 15 Pro',
    description: 'Flagship smartphone from Apple',
    category: 'smartphones',
    price: 999,
    discountPercentage: 10, // discounted = 899.10
    rating: 4.8,
    stock: 25,
    brand: 'Apple',
    tags: ['apple', 'smartphone', 'flagship'],
    thumbnail: 'https://example.com/thumb1.jpg',
    images: ['https://example.com/img1.jpg'],
  },
  {
    id: 2,
    title: 'Samsung Galaxy S24',
    description: 'Android flagship smartphone',
    category: 'smartphones',
    price: 899,
    discountPercentage: 15, // discounted = 764.15
    rating: 4.6,
    stock: 12,
    brand: 'Samsung',
    tags: ['android', 'smartphone', 'galaxy'],
    thumbnail: 'https://example.com/thumb2.jpg',
    images: ['https://example.com/img2.jpg'],
  },
  {
    id: 3,
    title: 'MacBook Pro 16',
    description: 'M3 Pro laptop',
    category: 'laptops',
    price: 2499,
    discountPercentage: 0,
    rating: 4.9,
    stock: 5,
    brand: 'Apple',
    tags: ['apple', 'laptop', 'mac'],
    thumbnail: 'https://example.com/thumb3.jpg',
    images: ['https://example.com/img3.jpg'],
  },
  {
    id: 4,
    title: 'Budget Earbuds',
    description: 'Affordable wireless earbuds',
    category: 'mobile-accessories',
    price: 20,
    discountPercentage: 0,
    rating: 3.5,
    stock: 0, // Out of stock
    brand: 'SoundBrand',
    tags: ['audio', 'earbuds'],
    thumbnail: 'https://example.com/thumb4.jpg',
    images: ['https://example.com/img4.jpg'],
  },
];

describe('Pricing and Cart Calculations', () => {
  test('calculateDiscountedPrice correctly computes discounted amount', () => {
    expect(calculateDiscountedPrice(100, 10)).toBe(90);
    expect(calculateDiscountedPrice(100, 0)).toBe(100);
    expect(calculateDiscountedPrice(999, 10)).toBe(899.1);
  });

  test('calculateCartTotals handles empty cart gracefully', () => {
    const totals = calculateCartTotals([]);
    expect(totals).toEqual({
      subtotal: 0,
      discountTotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
    });
  });

  test('calculateCartTotals applies standard shipping ($5.99) for orders under $50', () => {
    const items: CartItem[] = [
      {
        product: mockProducts[3], // $20, 0% discount
        quantity: 2, // $40 total (< $50)
      },
    ];

    const totals = calculateCartTotals(items);
    expect(totals.subtotal).toBe(40);
    expect(totals.discountTotal).toBe(0);
    expect(totals.shipping).toBe(5.99);
    // tax is 8% of 40 = 3.20
    expect(totals.tax).toBe(3.2);
    // total = 40 + 5.99 + 3.20 = 49.19
    expect(totals.total).toBe(49.19);
    expect(totals.itemCount).toBe(2);
  });

  test('calculateCartTotals gives FREE shipping for orders over $50', () => {
    const items: CartItem[] = [
      {
        product: mockProducts[0], // $999, 10% discount -> unit = 899.10
        quantity: 1,
      },
    ];

    const totals = calculateCartTotals(items);
    expect(totals.subtotal).toBe(999);
    expect(totals.discountTotal).toBe(99.9);
    expect(totals.shipping).toBe(0);
    // discountedSubtotal = 899.10
    // tax = 899.10 * 0.08 = 71.93
    expect(totals.tax).toBe(71.93);
    // total = 899.10 + 0 + 71.93 = 971.03
    expect(totals.total).toBe(971.03);
    expect(totals.itemCount).toBe(1);
  });
});

describe('Product Search and Filtering Logic', () => {
  const defaultFilters: ProductFilters = {
    searchQuery: '',
    selectedCategory: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    inStockOnly: false,
    sortBy: 'default',
  };

  test('filters by category', () => {
    const filtered = filterAndSortProducts(mockProducts, {
      ...defaultFilters,
      selectedCategory: 'smartphones',
    });
    expect(filtered).toHaveLength(2);
    expect(filtered.map(p => p.id)).toEqual([1, 2]);
  });

  test('filters by search query matching title, brand, description, and tags', () => {
    // Search by brand "Apple"
    const appleResults = filterAndSortProducts(mockProducts, {
      ...defaultFilters,
      searchQuery: 'apple',
    });
    expect(appleResults).toHaveLength(2); // iPhone 15 Pro and MacBook Pro 16

    // Search by tag "galaxy"
    const tagResults = filterAndSortProducts(mockProducts, {
      ...defaultFilters,
      searchQuery: 'galaxy',
    });
    expect(tagResults).toHaveLength(1);
    expect(tagResults[0].id).toBe(2);
  });

  test('filters by price range', () => {
    const priceFiltered = filterAndSortProducts(mockProducts, {
      ...defaultFilters,
      minPrice: 800,
      maxPrice: 1000,
    });
    expect(priceFiltered).toHaveLength(2);
    expect(priceFiltered.map(p => p.id)).toEqual([1, 2]);
  });

  test('filters in-stock items only', () => {
    const inStock = filterAndSortProducts(mockProducts, {
      ...defaultFilters,
      inStockOnly: true,
    });
    expect(inStock).toHaveLength(3);
    expect(inStock.some(p => p.id === 4)).toBe(false); // Budget Earbuds has stock 0
  });

  test('sorts by price ascending and descending', () => {
    const asc = filterAndSortProducts(mockProducts, {
      ...defaultFilters,
      sortBy: 'price_asc',
    });
    expect(asc[0].price).toBe(20);
    expect(asc[asc.length - 1].price).toBe(2499);

    const desc = filterAndSortProducts(mockProducts, {
      ...defaultFilters,
      sortBy: 'price_desc',
    });
    expect(desc[0].price).toBe(2499);
    expect(desc[desc.length - 1].price).toBe(20);
  });
});

describe('Similar Products Logic', () => {
  test('finds similar products based on category, brand, and tags affinity', () => {
    const target = mockProducts[0]; // iPhone 15 Pro (smartphones, Apple)
    const similar = findSimilarProducts(target, mockProducts, 3);

    // Should return Samsung Galaxy (same category: smartphones) and MacBook Pro (same brand: Apple)
    expect(similar.length).toBeGreaterThan(0);
    expect(similar.some(p => p.id === target.id)).toBe(false); // Never includes self

    // Samsung Galaxy shares category 'smartphones'
    expect(similar.map(p => p.id)).toContain(2);
    // MacBook Pro shares brand 'Apple' and tag 'apple'
    expect(similar.map(p => p.id)).toContain(3);
  });

  test('handles empty candidate pool gracefully', () => {
    expect(findSimilarProducts(mockProducts[0], [])).toEqual([]);
  });
});
