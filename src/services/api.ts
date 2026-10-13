import { Product, ProductsApiResponse } from '../types';
import { AppStorage } from './storage';

const BASE_URL = 'https://dummyjson.com';
const CACHE_PRODUCTS_KEY = '@cache_all_products_v1';
const CACHE_CATEGORIES_KEY = '@cache_categories_v1';

export interface ApiFetchOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * Robust fetch with timeout and exponential retry handling.
 */
async function fetchWithRetry(
  url: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { timeoutMs = 8000, retries = 2, retryDelayMs = 500 } = options;

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      attempt++;

      if (attempt <= retries) {
        const backoff = retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise(res => setTimeout(() => res(undefined), backoff));
      }
    }
  }

  throw lastError || new Error('Network request failed');
}

export const ApiService = {
  /**
   * Fetch products with pagination (limit and skip).
   * Automatically caches products in AppStorage for offline access.
   */
  async getProducts(
    limit: number = 20,
    skip: number = 0,
    options?: ApiFetchOptions
  ): Promise<ProductsApiResponse> {
    const url = `${BASE_URL}/products?limit=${limit}&skip=${skip}`;
    try {
      const res = await fetchWithRetry(url, options);
      const data: ProductsApiResponse = await res.json();

      // Update cached master product list if fetching initial page
      if (skip === 0 && data.products && data.products.length > 0) {
        await AppStorage.setJSON(CACHE_PRODUCTS_KEY, data.products);
      }

      return data;
    } catch (err) {
      // Fallback to offline cached products
      const cached = await AppStorage.getJSON<Product[]>(CACHE_PRODUCTS_KEY);
      if (cached && cached.length > 0) {
        const paginated = cached.slice(skip, skip + limit);
        return {
          products: paginated,
          total: cached.length,
          skip,
          limit,
        };
      }
      throw err;
    }
  },

  /**
   * Search products by query string.
   */
  async searchProducts(
    query: string,
    limit: number = 20,
    skip: number = 0,
    options?: ApiFetchOptions
  ): Promise<ProductsApiResponse> {
    const encoded = encodeURIComponent(query.trim());
    const url = `${BASE_URL}/products/search?q=${encoded}&limit=${limit}&skip=${skip}`;

    try {
      const res = await fetchWithRetry(url, options);
      return await res.json();
    } catch (err) {
      // Offline search fallback through cached products
      const cached = await AppStorage.getJSON<Product[]>(CACHE_PRODUCTS_KEY);
      if (cached && cached.length > 0) {
        const q = query.toLowerCase();
        const filtered = cached.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
        );
        return {
          products: filtered.slice(skip, skip + limit),
          total: filtered.length,
          skip,
          limit,
        };
      }
      throw err;
    }
  },

  /**
   * Fetch categories list from DummyJSON.
   */
  async getCategories(options?: ApiFetchOptions): Promise<string[]> {
    const url = `${BASE_URL}/products/category-list`;
    try {
      const res = await fetchWithRetry(url, options);
      const categories: string[] = await res.json();
      await AppStorage.setJSON(CACHE_CATEGORIES_KEY, categories);
      return categories;
    } catch {
      const cached = await AppStorage.getJSON<string[]>(CACHE_CATEGORIES_KEY);
      if (cached && cached.length > 0) {
        return cached;
      }
      return [
        'beauty',
        'fragrances',
        'furniture',
        'groceries',
        'home-decoration',
        'kitchen-accessories',
        'laptops',
        'smartphones',
      ];
    }
  },

  /**
   * Fetch products in a specific category.
   */
  async getProductsByCategory(
    category: string,
    limit: number = 20,
    skip: number = 0,
    options?: ApiFetchOptions
  ): Promise<ProductsApiResponse> {
    const encoded = encodeURIComponent(category);
    const url = `${BASE_URL}/products/category/${encoded}?limit=${limit}&skip=${skip}`;
    try {
      const res = await fetchWithRetry(url, options);
      return await res.json();
    } catch (err) {
      const cached = await AppStorage.getJSON<Product[]>(CACHE_PRODUCTS_KEY);
      if (cached && cached.length > 0) {
        const filtered = cached.filter(
          p => p.category?.toLowerCase() === category.toLowerCase()
        );
        return {
          products: filtered.slice(skip, skip + limit),
          total: filtered.length,
          skip,
          limit,
        };
      }
      throw err;
    }
  },

  /**
   * Fetch a single product by ID.
   */
  async getProductById(
    id: number,
    options?: ApiFetchOptions
  ): Promise<Product> {
    const url = `${BASE_URL}/products/${id}`;
    try {
      const res = await fetchWithRetry(url, options);
      return await res.json();
    } catch (err) {
      const cached = await AppStorage.getJSON<Product[]>(CACHE_PRODUCTS_KEY);
      const found = cached?.find(p => p.id === id);
      if (found) return found;
      throw err;
    }
  },
};
