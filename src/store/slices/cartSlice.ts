import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';
import { CartItem, CartTotals, Product } from '../../types';
import { calculateCartTotals } from '../../utils/calculations';

interface CartState {
  items: CartItem[];
  totals: CartTotals;
  abandonedCartNotificationId: string | null;
  lastUpdated: number;
  isHydrated: boolean;
}

const initialTotals: CartTotals = {
  subtotal: 0,
  discountTotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  itemCount: 0,
};

const initialState: CartState = {
  items: [],
  totals: initialTotals,
  abandonedCartNotificationId: null,
  lastUpdated: 0,
  isHydrated: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload || [];
      state.totals = calculateCartTotals(state.items);
      state.isHydrated = true;
    },

    addToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex(
        item => item.product.id === product.id
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }

      state.totals = calculateCartTotals(state.items);
      state.lastUpdated = Date.now();

      // Schedule or reschedule abandoned cart reminder
      const scheduled = notificationService.scheduleAbandonedCartReminder(
        state.totals.itemCount,
        15000 // 15 seconds reminder for demonstration and testing
      );
      state.abandonedCartNotificationId = scheduled.id;
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product.id !== productId);
      state.totals = calculateCartTotals(state.items);
      state.lastUpdated = Date.now();

      if (state.items.length === 0) {
        notificationService.cancelAbandonedCartReminder();
        state.abandonedCartNotificationId = null;
      }
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.product.id !== productId);
      } else {
        const item = state.items.find(i => i.product.id === productId);
        if (item) {
          item.quantity = quantity;
        }
      }

      state.totals = calculateCartTotals(state.items);
      state.lastUpdated = Date.now();

      if (state.items.length === 0) {
        notificationService.cancelAbandonedCartReminder();
        state.abandonedCartNotificationId = null;
      }
    },

    clearCart: state => {
      state.items = [];
      state.totals = initialTotals;
      state.lastUpdated = Date.now();
      notificationService.cancelAbandonedCartReminder();
      state.abandonedCartNotificationId = null;
    },

    setAbandonedCartNotificationId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.abandonedCartNotificationId = action.payload;
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setAbandonedCartNotificationId,
} = cartSlice.actions;

export default cartSlice.reducer;
