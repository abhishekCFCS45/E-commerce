import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { notificationService } from '../services/notificationService';
import {
  clearNotifications,
  setNotifications,
  showNotificationBanner,
} from '../store/slices/notificationsSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { NotificationItem } from '../types';

interface NotificationsScreenProps {
  onGoToCart: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onGoToCart,
}) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(state => state.notifications.items);
  const cartItemCount = useAppSelector(state => state.cart.totals.itemCount);

  const handleClear = () => {
    notificationService.clearAll();
    dispatch(clearNotifications());
  };

  const handleSimulateAbandonedCart = () => {
    // Schedule with a quick 3-second delay for instant demo testing
    notificationService.scheduleAbandonedCartReminder(
      Math.max(1, cartItemCount),
      3000
    );
    dispatch(setNotifications(notificationService.getAllNotifications()));
  };

  const handleFireImmediately = (item: NotificationItem) => {
    const fired = notificationService.fireNotification(item.id);
    if (fired) {
      dispatch(showNotificationBanner(fired));
      dispatch(setNotifications(notificationService.getAllNotifications()));
    }
  };

  const getStatusBadge = (status: NotificationItem['status']) => {
    switch (status) {
      case 'scheduled':
        return { text: 'Scheduled ⏱️', bg: '#FEF3C7', color: '#B45309' };
      case 'fired':
        return { text: 'Delivered 🔔', bg: '#DCFCE7', color: '#166534' };
      case 'cancelled':
        return { text: 'Cancelled 🚫', bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const badge = getStatusBadge(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>
              {badge.text}
            </Text>
          </View>
        </View>

        <Text style={styles.notifBody}>{item.body}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>
            Trigger:{' '}
            {item.triggerAt
              ? new Date(item.triggerAt).toLocaleTimeString()
              : 'Now'}
          </Text>

          {item.status === 'scheduled' && (
            <TouchableOpacity
              style={styles.fireBtn}
              onPress={() => handleFireImmediately(item)}
            >
              <Text style={styles.fireBtnText}>Trigger Now</Text>
            </TouchableOpacity>
          )}

          {item.status === 'fired' && (
            <TouchableOpacity style={styles.viewCartBtn} onPress={onGoToCart}>
              <Text style={styles.viewCartBtnText}>Go to Cart →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Top Demo Bar */}
      <View style={styles.demoBar}>
        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Abandoned Cart Notification Engine</Text>
          <Text style={styles.demoSub}>
            Reminders auto-schedule when adding to cart, and auto-cancel on checkout or cart clear.
          </Text>
        </View>

        <View style={styles.demoButtons}>
          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={handleSimulateAbandonedCart}
          >
            <Text style={styles.simulateBtnText}>
              + Schedule (3s Timer)
            </Text>
          </TouchableOpacity>
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>Clear Log</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Notifications Logged"
          description="Add items to your cart to schedule an abandoned-cart reminder, or tap the button above to simulate one."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  demoBar: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  demoInfo: {
    gap: 2,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  demoSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  simulateBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  simulateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notifBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  fireBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fireBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  viewCartBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewCartBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
});
