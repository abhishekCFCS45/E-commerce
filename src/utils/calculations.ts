import { CartItem, CartTotals, Product, ProductFilters } from '../types';

export const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates the discounted price of a single unit.
 * Example: price $100 with 10% discount = $90
 */
export const calculateDiscountedPrice = (
  price: number,
  discountPercentage: number = 0
): number => {
  if (discountPercentage <= 0) return price;
  const discounted = price * (1 - discountPercentage / 100);
  return roundToTwoDecimals(Math.max(0, discounted));
};

/**
 * Calculates cart totals including subtotal, discount, shipping, tax, and final amount.
 * Shipping is free for orders over $50.00; otherwise $5.99. Empty carts have $0 shipping.
 * Tax is calculated at a standard 8% on the discounted total.
 */
export const calculateCartTotals = (items: CartItem[]): CartTotals => {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      discountTotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
    };
  }

  let subtotal = 0;
  let discountedSubtotal = 0;
  let itemCount = 0;

  for (const item of items) {
    const qty = Math.max(0, item.quantity);
    const itemOriginal = item.product.price * qty;
    const unitDiscountedPrice = calculateDiscountedPrice(
      item.product.price,
      item.product.discountPercentage
    );
    const itemDiscounted = unitDiscountedPrice * qty;

    subtotal += itemOriginal;
    discountedSubtotal += itemDiscounted;
    itemCount += qty;
  }

  const discountTotal = Math.max(0, subtotal - discountedSubtotal);
  const shipping = discountedSubtotal > 0 && discountedSubtotal < 50 ? 5.99 : 0;
  const tax = roundToTwoDecimals(discountedSubtotal * 0.08);
  const total = roundToTwoDecimals(discountedSubtotal + shipping + tax);

  return {
    subtotal: roundToTwoDecimals(subtotal),
    discountTotal: roundToTwoDecimals(discountTotal),
    shipping: roundToTwoDecimals(shipping),
    tax,
    total,
    itemCount,
  };
};

/**
 * Filters and sorts product array in-memory for offline/cached views or client-side filtering.
 */
export const filterAndSortProducts = (
  products: Product[],
  filters: ProductFilters
): Product[] => {
  let result = [...products];

  // Category filter
  if (filters.selectedCategory) {
    const targetCat = filters.selectedCategory.toLowerCase();
    result = result.filter(
      p => p.category && p.category.toLowerCase() === targetCat
    );
  }

  // Search query filter (matches title, brand, description, tags)
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const q = filters.searchQuery.trim().toLowerCase();
    result = result.filter(p => {
      const titleMatch = p.title?.toLowerCase().includes(q);
      const brandMatch = p.brand?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const tagMatch = p.tags?.some(tag => tag.toLowerCase().includes(q));
      return Boolean(titleMatch || brandMatch || descMatch || tagMatch);
    });
  }

  // Min price filter
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    result = result.filter(p => p.price >= (filters.minPrice as number));
  }

  // Max price filter
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    result = result.filter(p => p.price <= (filters.maxPrice as number));
  }

  // Min rating filter
  if (filters.minRating !== null && filters.minRating !== undefined) {
    result = result.filter(p => p.rating >= (filters.minRating as number));
  }

  // Stock status filter
  if (filters.inStockOnly) {
    result = result.filter(p => (p.stock || 0) > 0);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating_desc':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'title_asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      // Default order
      break;
  }

  return result;
};

/**
 * Finds similar products based on category, brand, and tag matching.
 */
export const findSimilarProducts = (
  target: Product,
  pool: Product[],
  limit: number = 4
): Product[] => {
  if (!target || !pool || pool.length === 0) return [];

  const candidates = pool.filter(p => p.id !== target.id);

  const scored = candidates.map(item => {
    let score = 0;

    // Strong category affinity
    if (
      item.category &&
      target.category &&
      item.category.toLowerCase() === target.category.toLowerCase()
    ) {
      score += 5;
    }

    // Brand affinity
    if (
      item.brand &&
      target.brand &&
      item.brand.toLowerCase() === target.brand.toLowerCase()
    ) {
      score += 3;
    }

    // Common tags
    if (item.tags && target.tags) {
      const commonTags = item.tags.filter(t =>
        target.tags?.some(tt => tt.toLowerCase() === t.toLowerCase())
      );
      score += commonTags.length * 2;
    }

    // Price proximity bonus (within 30% price range)
    const priceDiff = Math.abs(item.price - target.price);
    const priceRatio = priceDiff / Math.max(target.price, 1);
    if (priceRatio < 0.3) {
      score += 1;
    }

    return { product: item, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);
};
