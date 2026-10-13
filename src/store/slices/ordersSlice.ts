import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';
import { Order } from '../../types';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isProcessing: boolean;
  isHydrated: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  isProcessing: false,
  isHydrated: false,
  error: null,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    hydrateOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload || [];
      state.isHydrated = true;
    },

    checkoutStart: state => {
      state.isProcessing = true;
      state.error = null;
    },

    checkoutSuccess: (state, action: PayloadAction<Order>) => {
      state.isProcessing = false;
      state.currentOrder = action.payload;
      state.orders.unshift(action.payload);
      state.error = null;

      // Purchase completed -> cancel any pending abandoned cart reminder
      notificationService.cancelAbandonedCartReminder();
    },

    checkoutFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    clearCurrentOrder: state => {
      state.currentOrder = null;
    },
  },
});

export const {
  hydrateOrders,
  checkoutStart,
  checkoutSuccess,
  checkoutFailure,
  clearCurrentOrder,
} = ordersSlice.actions;

export default ordersSlice.reducer;
