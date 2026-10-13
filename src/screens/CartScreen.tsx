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
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from '../store/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { CartItem } from '../types';
import { calculateDiscountedPrice } from '../utils/calculations';

interface CartScreenProps {
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onContinueShopping,
  onProceedToCheckout,
}) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  const totals = useAppSelector(state => state.cart.totals);
  const reminderId = useAppSelector(
    state => state.cart.abandonedCartNotificationId
  );

  const handleUpdateQty = (productId: number, newQty: number) => {
    dispatch(updateQuantity({ productId, quantity: newQty }));
  };

  const handleRemove = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your Cart is Empty"
        description="Looks like you haven't added any products to your cart yet. Explore our catalog and find great deals!"
        buttonLabel="Start Shopping"
        onButtonPress={onContinueShopping}
      />
    );
  }

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const unitPrice = calculateDiscountedPrice(
      item.product.price,
      item.product.discountPercentage
    );
    const itemTotal = unitPrice * item.quantity;

    return (
      <View style={styles.cartCard}>
        <Image
          source={{ uri: item.product.thumbnail }}
          style={styles.itemImage}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.product.title}
          </Text>
          <Text style={styles.unitPrice}>${unitPrice.toFixed(2)} each</Text>

          <View style={styles.itemBottomRow}>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => handleUpdateQty(item.product.id, item.quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => handleUpdateQty(item.product.id, item.quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemTotalContainer}>
              <Text style={styles.itemTotalPrice}>${itemTotal.toFixed(2)}</Text>
              <TouchableOpacity
                onPress={() => handleRemove(item.product.id)}
                style={styles.removeBtn}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {reminderId && (
        <View style={styles.reminderBanner}>
          <Text style={styles.reminderIcon}>⏰</Text>
          <Text style={styles.reminderText}>
            Abandoned-cart timer active: reminder will trigger if not checked out.
          </Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.itemsCountText}>
          {totals.itemCount} items in cart
        </Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearAllText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={item => `cart-${item.product.id}`}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Summary Footer */}
      <View style={styles.footerCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryVal}>${totals.subtotal.toFixed(2)}</Text>
        </View>

        {totals.discountTotal > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Savings & Discounts</Text>
            <Text style={styles.discountVal}>
              -${totals.discountTotal.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Shipping</Text>
          <Text style={styles.summaryVal}>
            {totals.shipping === 0
              ? 'FREE'
              : `$${totals.shipping.toFixed(2)}`}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Tax (8%)</Text>
          <Text style={styles.summaryVal}>${totals.tax.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalVal}>${totals.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={onProceedToCheckout}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  reminderBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderIcon: {
    fontSize: 14,
  },
  reminderText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  itemsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  clearAllText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 18,
  },
  unitPrice: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 18,
    textAlign: 'center',
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  removeBtn: {
    marginTop: 2,
  },
  removeBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '500',
  },
  footerCard: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  discountVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  checkoutBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
