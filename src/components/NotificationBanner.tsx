import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { dismissBanner } from '../store/slices/notificationsSlice';
import { useAppDispatch, useAppSelector } from '../store/store';

interface NotificationBannerProps {
  onNavigateToCart?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  onNavigateToCart,
}) => {
  const dispatch = useAppDispatch();
  const banner = useAppSelector(state => state.notifications.activeBanner);

  if (!banner) return null;

  const handleAction = () => {
    dispatch(dismissBanner());
    if (onNavigateToCart) {
      onNavigateToCart();
    }
  };

  const handleDismiss = () => {
    dispatch(dismissBanner());
  };

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>{banner.title}</Text>
        <Text style={styles.body}>{banner.body}</Text>
        <View style={styles.actions}>
          {banner.type === 'abandoned_cart' && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleAction}>
              <Text style={styles.actionBtnText}>Go to Cart</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
            <Text style={styles.dismissBtnText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  content: {
    gap: 4,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  dismissBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
});
