import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { notificationService } from '../services/notificationService';
import { AppStorage } from '../services/storage';
import { CartItem, Order, WishlistItem } from '../types';
import cartReducer, { hydrateCart } from './slices/cartSlice';
import notificationsReducer, {
  setNotifications,
  showNotificationBanner,
} from './slices/notificationsSlice';
import ordersReducer, { hydrateOrders } from './slices/ordersSlice';
import productsReducer from './slices/productsSlice';
import wishlistReducer, { hydrateWishlist } from './slices/wishlistSlice';

const STORAGE_KEYS = {
  CART: '@app_cart_v1',
  WISHLIST: '@app_wishlist_v1',
  ORDERS: '@app_orders_v1',
};

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
    notifications: notificationsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Persistence logic
let prevCartState: any = null;
let prevWishlistState: any = null;
let prevOrdersState: any = null;

store.subscribe(() => {
  const state = store.getState();

  // Persist cart when changed and hydrated
  if (state.cart.isHydrated && state.cart !== prevCartState) {
    prevCartState = state.cart;
    AppStorage.setJSON(STORAGE_KEYS.CART, state.cart.items);
  }

  // Persist wishlist when changed and hydrated
  if (state.wishlist.isHydrated && state.wishlist !== prevWishlistState) {
    prevWishlistState = state.wishlist;
    AppStorage.setJSON(STORAGE_KEYS.WISHLIST, state.wishlist.items);
  }

  // Persist orders when changed and hydrated
  if (state.orders.isHydrated && state.orders !== prevOrdersState) {
    prevOrdersState = state.orders;
    AppStorage.setJSON(STORAGE_KEYS.ORDERS, state.orders.orders);
  }
});

// App startup rehydration
export async function initializeStorePersistence(appStore = store) {
  try {
    const [savedCart, savedWishlist, savedOrders] = await Promise.all([
      AppStorage.getJSON<CartItem[]>(STORAGE_KEYS.CART),
      AppStorage.getJSON<WishlistItem[]>(STORAGE_KEYS.WISHLIST),
      AppStorage.getJSON<Order[]>(STORAGE_KEYS.ORDERS),
    ]);

    if (savedCart) {
      appStore.dispatch(hydrateCart(savedCart));
    } else {
      appStore.dispatch(hydrateCart([]));
    }

    if (savedWishlist) {
      appStore.dispatch(hydrateWishlist(savedWishlist));
    } else {
      appStore.dispatch(hydrateWishlist([]));
    }

    if (savedOrders) {
      appStore.dispatch(hydrateOrders(savedOrders));
    } else {
      appStore.dispatch(hydrateOrders([]));
    }

    const allNotifs = notificationService.getAllNotifications();
    appStore.dispatch(setNotifications(allNotifs));

    // Connect notification listener
    notificationService.subscribe(notification => {
      appStore.dispatch(showNotificationBanner(notification));
    });
  } catch (err) {
    console.warn('Failed to rehydrate store:', err);
  }
}
