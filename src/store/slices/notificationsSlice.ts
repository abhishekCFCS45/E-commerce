import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationItem } from '../../types';

interface NotificationsState {
  items: NotificationItem[];
  activeBanner: NotificationItem | null;
}

const initialState: NotificationsState = {
  items: [],
  activeBanner: null,
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      state.items = action.payload || [];
    },

    pushNotification: (state, action: PayloadAction<NotificationItem>) => {
      const existingIdx = state.items.findIndex(n => n.id === action.payload.id);
      if (existingIdx >= 0) {
        state.items[existingIdx] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    },

    showNotificationBanner: (state, action: PayloadAction<NotificationItem>) => {
      state.activeBanner = action.payload;
      const existingIdx = state.items.findIndex(n => n.id === action.payload.id);
      if (existingIdx >= 0) {
        state.items[existingIdx].status = 'fired';
      } else {
        state.items.unshift({ ...action.payload, status: 'fired' });
      }
    },

    dismissBanner: state => {
      state.activeBanner = null;
    },

    markNotificationCancelled: (state, action: PayloadAction<string>) => {
      const target = state.items.find(n => n.id === action.payload);
      if (target) {
        target.status = 'cancelled';
      }
      if (state.activeBanner?.id === action.payload) {
        state.activeBanner = null;
      }
    },

    clearNotifications: state => {
      state.items = [];
      state.activeBanner = null;
    },
  },
});

export const {
  setNotifications,
  pushNotification,
  showNotificationBanner,
  dismissBanner,
  markNotificationCancelled,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
