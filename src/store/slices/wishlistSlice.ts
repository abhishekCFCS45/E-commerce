import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, WishlistItem } from '../../types';

interface WishlistState {
  items: WishlistItem[];
  isHydrated: boolean;
}

const initialState: WishlistState = {
  items: [],
  isHydrated: false,
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    hydrateWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload || [];
      state.isHydrated = true;
    },

    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const index = state.items.findIndex(i => i.product.id === product.id);

      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.unshift({
          product,
          addedAt: new Date().toISOString(),
        });
      }
    },

    removeFromWishlist: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter(i => i.product.id !== productId);
    },

    clearWishlist: state => {
      state.items = [];
    },
  },
});

export const {
  hydrateWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
