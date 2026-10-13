import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppSelector } from '../store/store';

interface HeaderProps {
  title?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  onNavigateToWishlist?: () => void;
  onNavigateToCart?: () => void;
  onNavigateToNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Jio Store',
  canGoBack = false,
  onBack,
  onNavigateToWishlist,
  onNavigateToCart,
  onNavigateToNotifications,
}) => {
  const cartItemCount = useAppSelector(state => state.cart.totals.itemCount);
  const wishlistCount = useAppSelector(state => state.wishlist.items.length);
  const scheduledCount = useAppSelector(
    state =>
      state.notifications.items.filter(n => n.status === 'scheduled').length,
  );

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {canGoBack && onBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.actions}>
        {onNavigateToNotifications && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onNavigateToNotifications}
          >
            <Text style={styles.iconText}>🔔</Text>
            {scheduledCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{scheduledCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {onNavigateToWishlist && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onNavigateToWishlist}
          >
            <Text style={styles.iconText}>❤️</Text>
            {wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {onNavigateToCart && (
          <TouchableOpacity style={styles.iconBtn} onPress={onNavigateToCart}>
            <Text style={styles.iconText}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={[styles.badge, styles.cartBadge]}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  backIcon: {
    fontSize: 22,
    color: '#1E293B',
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    position: 'relative',
    padding: 6,
  },
  iconText: {
    fontSize: 19,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#2563EB',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
