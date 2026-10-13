import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Product } from '../types';
import { calculateDiscountedPrice } from '../utils/calculations';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, isWishlisted, onPress, onAddToCart, onToggleWishlist }) => {
    const discountedPrice = calculateDiscountedPrice(
      product.price,
      product.discountPercentage
    );
    const hasDiscount =
      product.discountPercentage && product.discountPercentage > 0;
    const isOutOfStock = product.stock <= 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onPress(product)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.thumbnail }}
            style={styles.image}
            resizeMode="cover"
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -{Math.round(product.discountPercentage)}%
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => onToggleWishlist(product)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.wishlistIcon}>
              {isWishlisted ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.details}>
          <Text style={styles.category} numberOfLines={1}>
            {product.category?.toUpperCase()}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>
              {product.rating ? product.rating.toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.stockText}>
              {isOutOfStock ? '• Out of Stock' : `• In Stock (${product.stock})`}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.prices}>
              <Text style={styles.price}>${discountedPrice.toFixed(2)}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>
                  ${product.price.toFixed(2)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.addBtn, isOutOfStock && styles.disabledAddBtn]}
              disabled={isOutOfStock}
              onPress={() => onAddToCart(product)}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    return (
      prev.product.id === next.product.id &&
      prev.isWishlisted === next.isWishlisted &&
      prev.product.stock === next.product.stock &&
      prev.product.price === next.product.price
    );
  }
);

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    position: 'relative',
    height: 170,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#EF4444',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistIcon: {
    fontSize: 15,
  },
  details: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 19,
    minHeight: 38,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  stockText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  prices: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  disabledAddBtn: {
    backgroundColor: '#CBD5E1',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
