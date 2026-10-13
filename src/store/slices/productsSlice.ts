import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiService } from '../../services/api';
import { Product, ProductFilters, SortOption } from '../../types';
import { findSimilarProducts } from '../../utils/calculations';

interface ProductsState {
  items: Product[];
  total: number;
  skip: number;
  limit: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  isOffline: boolean;
  categories: string[];
  categoriesLoading: boolean;
  filters: ProductFilters;
  selectedProduct: Product | null;
  similarProducts: Product[];
  selectedProductLoading: boolean;
}

const initialFilters: ProductFilters = {
  searchQuery: '',
  selectedCategory: null,
  minPrice: null,
  maxPrice: null,
  minRating: null,
  inStockOnly: false,
  sortBy: 'default',
};

const initialState: ProductsState = {
  items: [],
  total: 0,
  skip: 0,
  limit: 12,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  isOffline: false,
  categories: [],
  categoriesLoading: false,
  filters: initialFilters,
  selectedProduct: null,
  similarProducts: [],
  selectedProductLoading: false,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    arg: { refresh?: boolean; loadMore?: boolean } | undefined,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = (getState() as { products: ProductsState }).products;
      const { filters, limit, items } = state;
      const isLoadMore = Boolean(arg?.loadMore);
      const isRefresh = Boolean(arg?.refresh);

      const skip = isLoadMore ? items.length : 0;

      // Handle category or search endpoints vs standard
      let response;
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        response = await ApiService.searchProducts(
          filters.searchQuery.trim(),
          limit,
          skip
        );
      } else if (filters.selectedCategory) {
        response = await ApiService.getProductsByCategory(
          filters.selectedCategory,
          limit,
          skip
        );
      } else {
        response = await ApiService.getProducts(limit, skip);
      }

      return {
        products: response.products,
        total: response.total,
        skip,
        isLoadMore,
        isRefresh,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.message || 'Failed to fetch products. Check network.'
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await ApiService.getCategories();
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load categories');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as { products: ProductsState }).products;
      const existing = state.items.find(p => p.id === id);

      const product = await ApiService.getProductById(id).catch(() => existing);
      if (!product) {
        throw new Error(`Product #${id} not found.`);
      }

      // Compute similar products based on pool of loaded items
      const similar = findSimilarProducts(product, state.items, 4);

      return { product, similar };
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch product details');
    }
  }
);

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.filters.selectedCategory = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.filters.sortBy = action.payload;
    },
    setPriceFilter: (
      state,
      action: PayloadAction<{ min: number | null; max: number | null }>
    ) => {
      state.filters.minPrice = action.payload.min;
      state.filters.maxPrice = action.payload.max;
    },
    setRatingFilter: (state, action: PayloadAction<number | null>) => {
      state.filters.minRating = action.payload;
    },
    toggleInStockOnly: state => {
      state.filters.inStockOnly = !state.filters.inStockOnly;
    },
    resetFilters: state => {
      state.filters = initialFilters;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
      if (action.payload) {
        state.similarProducts = findSimilarProducts(
          action.payload,
          state.items,
          4
        );
      } else {
        state.similarProducts = [];
      }
    },
    clearProductError: state => {
      state.error = null;
    },
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
  },
  extraReducers: builder => {
    // Products
    builder.addCase(fetchProducts.pending, (state, action) => {
      if (action.meta.arg?.loadMore) {
        state.isLoadingMore = true;
      } else if (action.meta.arg?.refresh) {
        state.isRefreshing = true;
      } else {
        state.isLoading = true;
      }
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.isLoadingMore = false;
      state.total = action.payload.total;
      state.skip = action.payload.skip;

      if (action.payload.isLoadMore) {
        // Deduplicate appended items
        const existingIds = new Set(state.items.map(p => p.id));
        const newItems = action.payload.products.filter(
          p => !existingIds.has(p.id)
        );
        state.items = [...state.items, ...newItems];
      } else {
        state.items = action.payload.products;
      }
      state.isOffline = false;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.isLoadingMore = false;
      state.error = (action.payload as string) || 'Network error';
      // If we still have cached items, we can indicate offline mode
      if (state.items.length > 0) {
        state.isOffline = true;
      }
    });

    // Categories
    builder.addCase(fetchCategories.pending, state => {
      state.categoriesLoading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categoriesLoading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, state => {
      state.categoriesLoading = false;
    });

    // Product Details
    builder.addCase(fetchProductDetails.pending, state => {
      state.selectedProductLoading = true;
    });
    builder.addCase(fetchProductDetails.fulfilled, (state, action) => {
      state.selectedProductLoading = false;
      state.selectedProduct = action.payload.product;
      state.similarProducts = action.payload.similar;
    });
    builder.addCase(fetchProductDetails.rejected, (state, action) => {
      state.selectedProductLoading = false;
      state.error = (action.payload as string) || 'Could not load details';
    });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setPriceFilter,
  setRatingFilter,
  toggleInStockOnly,
  resetFilters,
  setSelectedProduct,
  clearProductError,
  setOfflineMode,
} = productsSlice.actions;

export default productsSlice.reducer;
