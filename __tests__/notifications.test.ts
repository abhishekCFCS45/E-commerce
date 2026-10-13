import { notificationService } from '../src/services/notificationService';
import {
  addToCart,
  clearCart,
  removeFromCart,
  updateQuantity,
} from '../src/store/slices/cartSlice';
import { checkoutSuccess } from '../src/store/slices/ordersSlice';
import { store } from '../src/store/store';
import { Product } from '../src/types';

const testProduct: Product = {
  id: 101,
  title: 'Test Wireless Headphones',
  description: 'Noise cancelling headphones',
  category: 'audio',
  price: 150,
  discountPercentage: 10,
  rating: 4.5,
  stock: 10,
  thumbnail: 'https://example.com/test.jpg',
  images: ['https://example.com/test.jpg'],
};

describe('Notification Service Engine', () => {
  beforeEach(() => {
    notificationService.clearAll();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('schedules abandoned-cart reminder and fires after delay', () => {
    const listener = jest.fn();
    const unsubscribe = notificationService.subscribe(listener);

    const scheduled = notificationService.scheduleAbandonedCartReminder(2, 5000);
    expect(scheduled).toBeDefined();
    expect(scheduled.status).toBe('scheduled');
    expect(scheduled.payload?.itemCount).toBe(2);

    expect(notificationService.getActiveAbandonedCartReminder()?.id).toBe(
      scheduled.id
    );

    // Fast-forward time
    jest.advanceTimersByTime(5000);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        id: scheduled.id,
        status: 'fired',
      })
    );

    expect(notificationService.getActiveAbandonedCartReminder()).toBeNull();
    unsubscribe();
  });

  test('cancels scheduled abandoned-cart reminder properly', () => {
    const scheduled = notificationService.scheduleAbandonedCartReminder(1, 10000);
    expect(scheduled.status).toBe('scheduled');

    const cancelled = notificationService.cancelAbandonedCartReminder();
    expect(cancelled).toBe(true);

    const active = notificationService.getActiveAbandonedCartReminder();
    expect(active).toBeNull();

    // Fast forward - listener should not be called
    const listener = jest.fn();
    notificationService.subscribe(listener);
    jest.advanceTimersByTime(10000);
    expect(listener).not.toHaveBeenCalled();
  });

  test('returns false when trying to cancel when no reminder is active', () => {
    notificationService.clearAll();
    expect(notificationService.cancelAbandonedCartReminder()).toBe(false);
  });
});

describe('Cart & Checkout Notification Lifecycle Integration', () => {
  beforeEach(() => {
    notificationService.clearAll();
    store.dispatch(clearCart());
  });

  test('adding product to cart automatically schedules abandoned-cart reminder', () => {
    store.dispatch(addToCart({ product: testProduct, quantity: 1 }));

    const cartState = store.getState().cart;
    expect(cartState.items).toHaveLength(1);
    expect(cartState.abandonedCartNotificationId).toBeTruthy();

    const activeReminder = notificationService.getActiveAbandonedCartReminder();
    expect(activeReminder).not.toBeNull();
    expect(activeReminder?.id).toBe(cartState.abandonedCartNotificationId);
  });

  test('clearing cart automatically cancels abandoned-cart reminder', () => {
    store.dispatch(addToCart({ product: testProduct, quantity: 1 }));
    expect(notificationService.getActiveAbandonedCartReminder()).not.toBeNull();

    store.dispatch(clearCart());
    const cartState = store.getState().cart;
    expect(cartState.items).toHaveLength(0);
    expect(cartState.abandonedCartNotificationId).toBeNull();
    expect(notificationService.getActiveAbandonedCartReminder()).toBeNull();
  });

  test('removing last item from cart cancels abandoned-cart reminder', () => {
    store.dispatch(addToCart({ product: testProduct, quantity: 1 }));
    expect(notificationService.getActiveAbandonedCartReminder()).not.toBeNull();

    store.dispatch(removeFromCart(testProduct.id));
    expect(store.getState().cart.items).toHaveLength(0);
    expect(notificationService.getActiveAbandonedCartReminder()).toBeNull();
  });

  test('reducing quantity to zero cancels abandoned-cart reminder', () => {
    store.dispatch(addToCart({ product: testProduct, quantity: 2 }));
    expect(notificationService.getActiveAbandonedCartReminder()).not.toBeNull();

    store.dispatch(updateQuantity({ productId: testProduct.id, quantity: 0 }));
    expect(store.getState().cart.items).toHaveLength(0);
    expect(notificationService.getActiveAbandonedCartReminder()).toBeNull();
  });

  test('completing purchase cancels abandoned-cart reminder', () => {
    store.dispatch(addToCart({ product: testProduct, quantity: 1 }));
    expect(notificationService.getActiveAbandonedCartReminder()).not.toBeNull();

    // Simulated order confirmation
    store.dispatch(
      checkoutSuccess({
        id: 'ORD-TEST-1',
        date: new Date().toISOString(),
        items: [
          {
            productId: testProduct.id,
            title: testProduct.title,
            price: testProduct.price,
            quantity: 1,
            thumbnail: testProduct.thumbnail,
          },
        ],
        totals: store.getState().cart.totals,
        shippingAddress: {
          fullName: 'John Tester',
          street: '123 Test St',
          city: 'Testerville',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
        paymentMethod: 'Credit Card',
        status: 'confirmed',
        estimatedDelivery: 'Oct 20',
      })
    );

    expect(notificationService.getActiveAbandonedCartReminder()).toBeNull();
  });
});
