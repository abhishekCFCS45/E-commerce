import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearCart } from '../store/slices/cartSlice';
import {
  checkoutStart,
  checkoutSuccess,
  clearCurrentOrder,
} from '../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { Order, OrderItem, ShippingAddress } from '../types';

interface CheckoutScreenProps {
  onBack: () => void;
  onViewOrderHistory: () => void;
  onContinueShopping: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  onBack: _onBack,
  onViewOrderHistory,
  onContinueShopping,
}) => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  const totals = useAppSelector(state => state.cart.totals);
  const isProcessing = useAppSelector(state => state.orders.isProcessing);
  const currentOrder = useAppSelector(state => state.orders.currentOrder);

  // Form state
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: 'Jane Doe',
    street: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zipCode: '97477',
    country: 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'cod'>('card');
  const [formError, setFormError] = useState('');

  const handlePlaceOrder = async () => {
    if (!address.fullName.trim() || !address.street.trim() || !address.city.trim()) {
      setFormError('Please fill in all shipping address fields.');
      return;
    }
    setFormError('');

    dispatch(checkoutStart());

    // Simulate payment processing latency
    setTimeout(() => {
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        thumbnail: item.product.thumbnail,
      }));

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 4);

      const newOrder: Order = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        date: new Date().toISOString(),
        items: orderItems,
        totals: { ...totals },
        shippingAddress: { ...address },
        paymentMethod:
          paymentMethod === 'card'
            ? 'Credit Card (ending 4242)'
            : paymentMethod === 'apple_pay'
            ? 'Apple Pay'
            : 'Cash on Delivery',
        status: 'confirmed',
        estimatedDelivery: deliveryDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      };

      dispatch(checkoutSuccess(newOrder));
      dispatch(clearCart());
    }, 1200);
  };

  // If order was successfully completed, show Confirmation View
  if (currentOrder) {
    return (
      <SafeAreaView style={styles.confirmContainer} edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.confirmContent}>
          <View style={styles.successBadge}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.confirmTitle}>Order Confirmed!</Text>
          <Text style={styles.confirmSubtitle}>
            Thank you for your purchase. We have received your order and are preparing it for shipment.
          </Text>

          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order ID:</Text>
              <Text style={styles.orderVal}>{currentOrder.id}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total Paid:</Text>
              <Text style={styles.orderTotalVal}>
                ${currentOrder.totals.total.toFixed(2)}
              </Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Estimated Delivery:</Text>
              <Text style={styles.orderVal}>
                {currentOrder.estimatedDelivery}
              </Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Payment:</Text>
              <Text style={styles.orderVal}>{currentOrder.paymentMethod}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Ship To:</Text>
              <Text style={styles.orderVal}>
                {currentOrder.shippingAddress.fullName},{' '}
                {currentOrder.shippingAddress.city}
              </Text>
            </View>
          </View>

          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => {
                dispatch(clearCurrentOrder());
                onViewOrderHistory();
              }}
            >
              <Text style={styles.historyBtnText}>View Purchase History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => {
                dispatch(clearCurrentOrder());
                onContinueShopping();
              }}
            >
              <Text style={styles.continueBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Checkout</Text>

      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

      {/* Shipping Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Shipping Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={address.fullName}
          onChangeText={t => setAddress({ ...address, fullName: t })}
          placeholderTextColor="#94A3B8"
        />
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          value={address.street}
          onChangeText={t => setAddress({ ...address, street: t })}
          placeholderTextColor="#94A3B8"
        />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputCity]}
            placeholder="City"
            value={address.city}
            onChangeText={t => setAddress({ ...address, city: t })}
            placeholderTextColor="#94A3B8"
          />
          <TextInput
            style={[styles.input, styles.inputState]}
            placeholder="State"
            value={address.state}
            onChangeText={t => setAddress({ ...address, state: t })}
            placeholderTextColor="#94A3B8"
          />
          <TextInput
            style={[styles.input, styles.inputZip]}
            placeholder="ZIP"
            value={address.zipCode}
            onChangeText={t => setAddress({ ...address, zipCode: t })}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Payment Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment Method</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === 'card' && styles.paymentCardActive,
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={styles.paymentTitle}>Credit Card</Text>
            <Text style={styles.paymentSub}>Visa ending 4242</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === 'apple_pay' && styles.paymentCardActive,
            ]}
            onPress={() => setPaymentMethod('apple_pay')}
          >
            <Text style={styles.paymentTitle}>Apple Pay</Text>
            <Text style={styles.paymentSub}>Touch ID / Face ID</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === 'cod' && styles.paymentCardActive,
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text style={styles.paymentTitle}>Pay on Delivery</Text>
            <Text style={styles.paymentSub}>Cash / Card on receipt</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧾 Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({totals.itemCount}):</Text>
            <Text style={styles.summaryVal}>${totals.subtotal.toFixed(2)}</Text>
          </View>
          {totals.discountTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount Savings:</Text>
              <Text style={styles.savingsVal}>
                -${totals.discountTotal.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={styles.summaryVal}>
              {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8%):</Text>
            <Text style={styles.summaryVal}>${totals.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Order Total:</Text>
            <Text style={styles.totalAmount}>${totals.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, isProcessing && styles.submitBtnDisabled]}
        disabled={isProcessing}
        onPress={handlePlaceOrder}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitBtnText}>
            Place Simulated Order • ${totals.total.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  inputCity: {
    flex: 2,
  },
  inputState: {
    flex: 1,
  },
  inputZip: {
    flex: 1.2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentOptions: {
    gap: 10,
  },
  paymentCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  paymentCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  summaryCard: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  savingsVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB',
  },
  submitBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#86EFAC',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  confirmContent: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  successBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 32,
    color: '#16A34A',
    fontWeight: '800',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 28,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  orderVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  orderTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  confirmActions: {
    width: '100%',
    gap: 12,
  },
  historyBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  historyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
});
