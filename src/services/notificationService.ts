import { NotificationItem } from '../types';
import { AppStorage } from './storage';

const STORAGE_KEY = '@app_notifications_v1';
const ABANDONED_CART_KEY = '@abandoned_cart_active_id';

type NotificationListener = (notification: NotificationItem) => void;

class NotificationService {
  private activeTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private listeners: Set<NotificationListener> = new Set();
  private notifications: NotificationItem[] = [];
  private activeAbandonedCartId: string | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      const saved = await AppStorage.getJSON<NotificationItem[]>(STORAGE_KEY);
      if (saved && Array.isArray(saved)) {
        this.notifications = saved;
      }
      const activeId = await AppStorage.getItem(ABANDONED_CART_KEY);
      if (activeId) {
        this.activeAbandonedCartId = activeId;
      }
    } catch {
      // Ignored
    }
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(notification: NotificationItem) {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (err) {
        console.warn('Notification listener error:', err);
      }
    });
  }

  private async persist() {
    await AppStorage.setJSON(STORAGE_KEY, this.notifications);
    if (this.activeAbandonedCartId) {
      await AppStorage.setItem(ABANDONED_CART_KEY, this.activeAbandonedCartId);
    } else {
      await AppStorage.removeItem(ABANDONED_CART_KEY);
    }
  }

  /**
   * Schedule an abandoned cart reminder.
   * If one already exists, the old timer is cancelled and a fresh one is rescheduled.
   */
  public scheduleAbandonedCartReminder(
    itemCount: number,
    delayMs: number = 10000 // default 10 seconds for demonstration & testability
  ): NotificationItem {
    // Cancel any existing pending reminder first
    this.cancelAbandonedCartReminder();

    const id = `notif_cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();
    const triggerAt = now + delayMs;

    const notification: NotificationItem = {
      id,
      title: '🛒 Items waiting in your cart!',
      body: `You have ${itemCount} item${itemCount > 1 ? 's' : ''} left in your cart. Complete your purchase now!`,
      scheduledAt: now,
      triggerAt,
      type: 'abandoned_cart',
      status: 'scheduled',
      payload: { itemCount },
    };

    this.notifications.unshift(notification);
    this.activeAbandonedCartId = id;
    this.persist();

    const timer = setTimeout(() => {
      this.fireNotification(id);
    }, delayMs);

    this.activeTimers.set(id, timer);

    return notification;
  }

  /**
   * Cancel the abandoned cart reminder (e.g. when cart cleared or purchase completed).
   */
  public cancelAbandonedCartReminder(): boolean {
    if (!this.activeAbandonedCartId) {
      return false;
    }

    const id = this.activeAbandonedCartId;
    const timer = this.activeTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(id);
    }

    const target = this.notifications.find(n => n.id === id);
    if (target && target.status === 'scheduled') {
      target.status = 'cancelled';
    }

    this.activeAbandonedCartId = null;
    this.persist();
    return true;
  }

  /**
   * Fire scheduled notification when timer elapses.
   */
  public fireNotification(id: string): NotificationItem | null {
    const timer = this.activeTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(id);
    }

    const target = this.notifications.find(n => n.id === id);
    if (target && target.status === 'scheduled') {
      target.status = 'fired';
      if (this.activeAbandonedCartId === id) {
        this.activeAbandonedCartId = null;
      }
      this.persist();
      this.emit(target);
      return target;
    }

    return null;
  }

  public getActiveAbandonedCartReminder(): NotificationItem | null {
    if (!this.activeAbandonedCartId) return null;
    return (
      this.notifications.find(
        n => n.id === this.activeAbandonedCartId && n.status === 'scheduled'
      ) || null
    );
  }

  public getAllNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  public clearAll(): void {
    this.activeTimers.forEach(t => clearTimeout(t));
    this.activeTimers.clear();
    this.activeAbandonedCartId = null;
    this.notifications = [];
    this.persist();
  }
}

export const notificationService = new NotificationService();
