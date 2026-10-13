import cartReducer, {
  addToCart,
  hydrateCart,
  removeFromCart,
  updateQuantity,
} from '../src/store/slices/cartSlice';
import ordersReducer, {
  checkoutStart,
  checkoutSuccess,
  clearCurrentOrder,
} from '../src/store/slices/ordersSlice';
import productsReducer, {
  resetFilters,
  setPriceFilter,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
} from '../src/store/slices/productsSlice';
import wishlistReducer, {
  clearWishlist,
  toggleWishlist,
} from '../src/store/slices/wishlistSlice';
import { CartItem, Order, Product } from '../src/types';

const mockProduct: Product = {
  id: 42,
  title: 'Smart Fitness Watch',
  description: 'Water resistant fitness tracker',
  category: 'wearables',
  price: 120,
  discountPercentage: 20, // unit price = 96
  rating: 4.7,
  stock: 15,
  thumbnail: 'https://example.com/watch.jpg',
  images: ['https://example.com/watch.jpg'],
};

describe('Redux Cart Slice Reducers', () => {
  const initialCartState = {
    items: [],
    totals: {
      subtotal: 0,
      discountTotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
    },
    abandonedCartNotificationId: null,
    lastUpdated: 0,
    isHydrated: false,
  };

  test('addToCart adds new product and calculates totals', () => {
    const nextState = cartReducer(
      initialCartState,
      addToCart({ product: mockProduct, quantity: 2 })
    );

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].quantity).toBe(2);
    expect(nextState.totals.subtotal).toBe(240);
    expect(nextState.totals.discountTotal).toBe(48); // 240 - 192 = 48
    expect(nextState.totals.itemCount).toBe(2);
    expect(nextState.abandonedCartNotificationId).toBeTruthy();
  });

  test('updateQuantity updates existing product quantity and recalculates totals', () => {
    const populatedState = cartReducer(
      initialCartState,
      addToCart({ product: mockProduct, quantity: 1 })
    );

    const updated = cartReducer(
      populatedState,
      updateQuantity({ productId: mockProduct.id, quantity: 3 })
    );

    expect(updated.items[0].quantity).toBe(3);
    expect(updated.totals.itemCount).toBe(3);
  });

  test('removeFromCart removes item', () => {
    const populatedState = cartReducer(
      initialCartState,
      addToCart({ product: mockProduct, quantity: 1 })
    );

    const removed = cartReducer(populatedState, removeFromCart(mockProduct.id));
    expect(removed.items).toHaveLength(0);
    expect(removed.totals.itemCount).toBe(0);
  });

  test('hydrateCart correctly restores stored items', () => {
    const storedItems: CartItem[] = [{ product: mockProduct, quantity: 4 }];
    const hydrated = cartReducer(initialCartState, hydrateCart(storedItems));

    expect(hydrated.items).toHaveLength(1);
    expect(hydrated.isHydrated).toBe(true);
    expect(hydrated.totals.itemCount).toBe(4);
  });
});

describe('Redux Wishlist Slice Reducers', () => {
  const initialWishlistState = {
    items: [],
    isHydrated: false,
  };

  test('toggleWishlist adds product if not in wishlist', () => {
    const state = wishlistReducer(
      initialWishlistState,
      toggleWishlist(mockProduct)
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].product.id).toBe(mockProduct.id);
  });

  test('toggleWishlist removes product if already in wishlist', () => {
    const withItem = wishlistReducer(
      initialWishlistState,
      toggleWishlist(mockProduct)
    );
    const toggledOff = wishlistReducer(withItem, toggleWishlist(mockProduct));
    expect(toggledOff.items).toHaveLength(0);
  });

  test('clearWishlist clears all wishlist items', () => {
    const withItem = wishlistReducer(
      initialWishlistState,
      toggleWishlist(mockProduct)
    );
    const cleared = wishlistReducer(withItem, clearWishlist());
    expect(cleared.items).toHaveLength(0);
  });
});

describe('Redux Orders Slice Reducers', () => {
  const initialOrdersState = {
    orders: [],
    currentOrder: null,
    isProcessing: false,
    isHydrated: false,
    error: null,
  };

  test('checkoutStart sets isProcessing to true', () => {
    const state = ordersReducer(initialOrdersState, checkoutStart());
    expect(state.isProcessing).toBe(true);
  });

  test('checkoutSuccess updates order history and resets isProcessing', () => {
    const mockOrder: Order = {
      id: 'ORD-999',
      date: new Date().toISOString(),
      items: [],
      totals: {
        subtotal: 100,
        discountTotal: 0,
        shipping: 0,
        tax: 8,
        total: 108,
        itemCount: 1,
      },
      shippingAddress: {
        fullName: 'Alex Doe',
        street: '1 Main St',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      paymentMethod: 'Credit Card',
      status: 'confirmed',
      estimatedDelivery: 'Tomorrow',
    };

    const state = ordersReducer(initialOrdersState, checkoutSuccess(mockOrder));
    expect(state.isProcessing).toBe(false);
    expect(state.orders).toHaveLength(1);
    expect(state.currentOrder?.id).toBe('ORD-999');
  });

  test('clearCurrentOrder resets currentOrder', () => {
    const mockOrder = { id: 'ORD-1' } as Order;
    const withOrder = ordersReducer(
      initialOrdersState,
      checkoutSuccess(mockOrder)
    );
    const cleared = ordersReducer(withOrder, clearCurrentOrder());
    expect(cleared.currentOrder).toBeNull();
  });
});

describe('Redux Products Slice Filter Reducers', () => {
  const initialProductsState: any = {
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
    filters: {
      searchQuery: '',
      selectedCategory: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      inStockOnly: false,
      sortBy: 'default',
    },
    selectedProduct: null,
    similarProducts: [],
    selectedProductLoading: false,
  };

  test('updates search query', () => {
    const state = productsReducer(
      initialProductsState,
      setSearchQuery('laptop')
    );
    expect(state.filters.searchQuery).toBe('laptop');
  });

  test('updates selected category', () => {
    const state = productsReducer(
      initialProductsState,
      setSelectedCategory('fragrances')
    );
    expect(state.filters.selectedCategory).toBe('fragrances');
  });

  test('updates sort by option', () => {
    const state = productsReducer(initialProductsState, setSortBy('price_asc'));
    expect(state.filters.sortBy).toBe('price_asc');
  });

  test('updates price filter', () => {
    const state = productsReducer(
      initialProductsState,
      setPriceFilter({ min: 50, max: 200 })
    );
    expect(state.filters.minPrice).toBe(50);
    expect(state.filters.maxPrice).toBe(200);
  });

  test('resets filters back to default', () => {
    let state = productsReducer(initialProductsState, setSearchQuery('test'));
    state = productsReducer(state, setSortBy('price_desc'));
    const reset = productsReducer(state, resetFilters());

    expect(reset.filters.searchQuery).toBe('');
    expect(reset.filters.sortBy).toBe('default');
  });
});
