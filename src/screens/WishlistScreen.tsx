import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { addToCart } from '../store/slices/cartSlice';
import {
  clearWishlist,
  removeFromWishlist,
} from '../store/slices/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { Product, WishlistItem } from '../types';

interface WishlistScreenProps {
  onContinueShopping: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  onContinueShopping,
  onSelectProduct,
}) => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);

  const handleMoveToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(removeFromWishlist(product.id));
  };

  const handleRemove = (productId: number) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleClear = () => {
    dispatch(clearWishlist());
  };

  if (wishlistItems.length === 0) {
    return (
      <EmptyState
        icon="❤️"
        title="Your Wishlist is Empty"
        description="Tap the heart icon on any product to save it here for later."
        buttonLabel="Explore Products"
        onButtonPress={onContinueShopping}
      />
    );
  }

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const { product } = item;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => onSelectProduct(product)}
      >
        <Image source={{ uri: product.thumbnail }} style={styles.thumbnail} />
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.moveBtn}
              onPress={() => handleMoveToCart(product)}
            >
              <Text style={styles.moveBtnText}>Move to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(product.id)}
            >
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.countText}>
          {wishlistItems.length} Saved Item{wishlistItems.length > 1 ? 's' : ''}
        </Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={wishlistItems}
        keyExtractor={item => `wishlist-${item.product.id}`}
        renderItem={renderWishlistItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  clearText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  moveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  moveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  removeBtnText: {
    color: '#64748B',
    fontSize: 12,
  },
});
