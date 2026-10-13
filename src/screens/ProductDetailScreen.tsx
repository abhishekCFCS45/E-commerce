import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageGallery } from '../components/ImageGallery';
import { addToCart } from '../store/slices/cartSlice';
import { fetchProductDetails } from '../store/slices/productsSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { Product } from '../types';
import { calculateDiscountedPrice } from '../utils/calculations';

interface ProductDetailScreenProps {
  productId: number;
  onBack: () => void;
  onSelectSimilarProduct: (product: Product) => void;
  onGoToCart: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId,
  onBack: _onBack,
  onSelectSimilarProduct,
  onGoToCart,
}) => {
  const dispatch = useAppDispatch();
  const product = useAppSelector(state => state.products.selectedProduct);
  const similarProducts = useAppSelector(
    state => state.products.similarProducts
  );
  const isLoading = useAppSelector(
    state => state.products.selectedProductLoading
  );
  const wishlistItems = useAppSelector(state => state.wishlist.items);

  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    setQuantity(1);
    setAddedNotice(false);
  }, [dispatch, productId]);

  const isWishlisted = Boolean(
    product && wishlistItems.some(w => w.product.id === product.id)
  );

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ product, quantity }));
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
  };

  if (isLoading || !product) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  const discountedPrice = calculateDiscountedPrice(
    product.price,
    product.discountPercentage
  );
  const hasDiscount =
    product.discountPercentage && product.discountPercentage > 0;
  const savings = Math.max(0, product.price - discountedPrice);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery */}
        <ImageGallery
          images={product.images}
          thumbnail={product.thumbnail}
        />

        <View style={styles.content}>
          {/* Brand & Category */}
          <View style={styles.badgeRow}>
            {product.brand && (
              <View style={styles.brandBadge}>
                <Text style={styles.brandText}>{product.brand}</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {product.category?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Title & Wishlist */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.title}</Text>
            <TouchableOpacity
              style={styles.wishlistBtn}
              onPress={handleToggleWishlist}
            >
              <Text style={styles.wishlistIcon}>
                {isWishlisted ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rating & Stock */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.ratingText}>
                {product.rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
            <Text style={styles.stockStatus}>
              {product.stock > 0
                ? `In Stock (${product.stock} units)`
                : 'Out of Stock'}
            </Text>
          </View>

          {/* Pricing */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${discountedPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.originalPrice}>
                  ${product.price.toFixed(2)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(product.discountPercentage)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>
          {hasDiscount && (
            <Text style={styles.savingsText}>
              You save ${savings.toFixed(2)}
            </Text>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Shipping & Policies */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🚚 Shipping:</Text>
              <Text style={styles.infoVal}>
                {product.shippingInformation || 'Standard Shipping'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🛡️ Warranty:</Text>
              <Text style={styles.infoVal}>
                {product.warrantyInformation || 'Standard manufacturer warranty'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🔄 Returns:</Text>
              <Text style={styles.infoVal}>
                {product.returnPolicy || '30 days return policy'}
              </Text>
            </View>
          </View>

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Customer Reviews ({product.reviews.length})
              </Text>
              {product.reviews.map((rev, index) => (
                <View key={`review-${index}`} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                    <Text style={styles.reviewRating}>
                      {'⭐'.repeat(Math.round(rev.rating))}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(rev.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Similar Products */}
          {similarProducts && similarProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Similar Products</Text>
              <FlatList
                data={similarProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => `similar-${item.id}`}
                contentContainerStyle={styles.similarList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.similarCard}
                    onPress={() => onSelectSimilarProduct(item)}
                  >
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.similarImage}
                    />
                    <Text style={styles.similarTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.similarPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add to Cart Footer */}
      <View style={styles.bottomBar}>
        {addedNotice && (
          <View style={styles.addedNoticeBar}>
            <Text style={styles.addedNoticeText}>
              ✓ Added to cart! Abandoned-cart reminder set.
            </Text>
            <TouchableOpacity onPress={onGoToCart}>
              <Text style={styles.viewCartLink}>View Cart →</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomControls}>
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartBtn,
              product.stock <= 0 && styles.disabledBtn,
            ]}
            disabled={product.stock <= 0}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartBtnText}>
              {product.stock <= 0
                ? 'Out of Stock'
                : `Add to Cart • $${(discountedPrice * quantity).toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  brandBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 26,
  },
  wishlistBtn: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wishlistIcon: {
    fontSize: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  star: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  stockStatus: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 14,
    gap: 10,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 16,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  savingsText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  infoVal: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  reviewItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontWeight: '700',
    fontSize: 13,
    color: '#1E293B',
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  similarList: {
    gap: 12,
    paddingTop: 4,
  },
  similarCard: {
    width: 130,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  similarImage: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  similarTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 6,
  },
  similarPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  addedNoticeBar: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addedNoticeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600',
  },
  viewCartLink: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#94A3B8',
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
