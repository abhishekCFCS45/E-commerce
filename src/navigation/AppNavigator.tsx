import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { NotificationBanner } from '../components/NotificationBanner';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { useAppSelector } from '../store/store';
import { Product } from '../types';

export type ScreenType =
  | 'products'
  | 'detail'
  | 'cart'
  | 'wishlist'
  | 'checkout'
  | 'orders'
  | 'notifications';

export const AppNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('products');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  const cartItemCount = useAppSelector(state => state.cart.totals.itemCount);
  const wishlistCount = useAppSelector(state => state.wishlist.items.length);
  const scheduledCount = useAppSelector(
    state =>
      state.notifications.items.filter(n => n.status === 'scheduled').length,
  );
  const orderCount = useAppSelector(state => state.orders.orders.length);

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setCurrentScreen('detail');
  };

  const handleBack = () => {
    if (currentScreen === 'detail') {
      setCurrentScreen('products');
    } else if (currentScreen === 'checkout') {
      setCurrentScreen('cart');
    } else {
      setCurrentScreen('products');
    }
  };

  const getScreenTitle = (): string => {
    switch (currentScreen) {
      case 'products':
        return 'Jio Store';
      case 'detail':
        return 'Product Details';
      case 'cart':
        return 'Shopping Cart';
      case 'wishlist':
        return 'Saved Items';
      case 'checkout':
        return 'Checkout';
      case 'orders':
        return 'Purchase History';
      case 'notifications':
        return 'Notifications';
      default:
        return 'Jio Store';
    }
  };

  const canGoBack = currentScreen === 'detail' || currentScreen === 'checkout';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <Header
        title={getScreenTitle()}
        canGoBack={canGoBack}
        onBack={handleBack}
        onNavigateToWishlist={() => setCurrentScreen('wishlist')}
        onNavigateToCart={() => setCurrentScreen('cart')}
        onNavigateToNotifications={() => setCurrentScreen('notifications')}
      />

      {/* Global In-App Notification Banner */}
      <NotificationBanner onNavigateToCart={() => setCurrentScreen('cart')} />

      {/* Screen Body */}
      <View style={styles.screenBody}>
        {currentScreen === 'products' && (
          <ProductListScreen onSelectProduct={handleSelectProduct} />
        )}

        {currentScreen === 'detail' && selectedProductId !== null && (
          <ProductDetailScreen
            productId={selectedProductId}
            onBack={handleBack}
            onSelectSimilarProduct={handleSelectProduct}
            onGoToCart={() => setCurrentScreen('cart')}
          />
        )}

        {currentScreen === 'cart' && (
          <CartScreen
            onContinueShopping={() => setCurrentScreen('products')}
            onProceedToCheckout={() => setCurrentScreen('checkout')}
          />
        )}

        {currentScreen === 'wishlist' && (
          <WishlistScreen
            onContinueShopping={() => setCurrentScreen('products')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentScreen === 'checkout' && (
          <CheckoutScreen
            onBack={handleBack}
            onViewOrderHistory={() => setCurrentScreen('orders')}
            onContinueShopping={() => setCurrentScreen('products')}
          />
        )}

        {currentScreen === 'orders' && (
          <OrderHistoryScreen
            onContinueShopping={() => setCurrentScreen('products')}
          />
        )}

        {currentScreen === 'notifications' && (
          <NotificationsScreen onGoToCart={() => setCurrentScreen('cart')} />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('products')}
        >
          <Text
            style={[
              styles.tabIcon,
              currentScreen === 'products' && styles.tabActiveIcon,
            ]}
          >
            🛍️
          </Text>
          <Text
            style={[
              styles.tabLabel,
              currentScreen === 'products' && styles.tabActiveLabel,
            ]}
          >
            Shop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('wishlist')}
        >
          <View style={styles.tabIconWrapper}>
            <Text
              style={[
                styles.tabIcon,
                currentScreen === 'wishlist' && styles.tabActiveIcon,
              ]}
            >
              ❤️
            </Text>
            {wishlistCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{wishlistCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentScreen === 'wishlist' && styles.tabActiveLabel,
            ]}
          >
            Wishlist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('cart')}
        >
          <View style={styles.tabIconWrapper}>
            <Text
              style={[
                styles.tabIcon,
                currentScreen === 'cart' && styles.tabActiveIcon,
              ]}
            >
              🛒
            </Text>
            {cartItemCount > 0 && (
              <View style={[styles.tabBadge, styles.cartTabBadge]}>
                <Text style={styles.tabBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentScreen === 'cart' && styles.tabActiveLabel,
            ]}
          >
            Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('orders')}
        >
          <View style={styles.tabIconWrapper}>
            <Text
              style={[
                styles.tabIcon,
                currentScreen === 'orders' && styles.tabActiveIcon,
              ]}
            >
              🧾
            </Text>
            {orderCount > 0 && (
              <View style={[styles.tabBadge, styles.orderTabBadge]}>
                <Text style={styles.tabBadgeText}>{orderCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentScreen === 'orders' && styles.tabActiveLabel,
            ]}
          >
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentScreen('notifications')}
        >
          <View style={styles.tabIconWrapper}>
            <Text
              style={[
                styles.tabIcon,
                currentScreen === 'notifications' && styles.tabActiveIcon,
              ]}
            >
              🔔
            </Text>
            {scheduledCount > 0 && (
              <View style={[styles.tabBadge, styles.notifTabBadge]}>
                <Text style={styles.tabBadgeText}>{scheduledCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentScreen === 'notifications' && styles.tabActiveLabel,
            ]}
          >
            Alerts
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenBody: {
    flex: 1,
  },
  tabBar: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconWrapper: {
    position: 'relative',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabActiveIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  tabActiveLabel: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartTabBadge: {
    backgroundColor: '#2563EB',
  },
  orderTabBadge: {
    backgroundColor: '#10B981',
  },
  notifTabBadge: {
    backgroundColor: '#F59E0B',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
