import { merge, orderBy, uniqueId } from 'lodash';
import { computed, ref } from 'vue';

import { TransactionStatus } from './useTransactions';

const DEFAULT_NOTIFICATION_TIMEOUT = 15 * 1_000; // 15s

export type Notification = {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  transactionMetadata?: {
    id: string;
    status: TransactionStatus;
    explorerLink: string;
  };
  title: string;
  message: string;
  autoCloseAfterMs?: number; // set 0 to disable
  addedTime?: number;
};

export type NewNotification = Pick<
  Notification,
  'type' | 'message' | 'title' | 'autoCloseAfterMs' | 'transactionMetadata'
>;

type NotificationsMap = Record<string, Notification>;

const notificationsState = ref<NotificationsMap>({});

// METHODS
function addNotification(newNotification: NewNotification) {
  const notificationsMap = getNotifications();
  const notificationId = uniqueId('notification');

  attemptToRemoveExistingNotification(newNotification);

  notificationsMap[notificationId] = {
    ...newNotification,
    id: notificationId,
    type: newNotification.type ?? 'info',
    addedTime: Date.now(),
    autoCloseAfterMs:
      newNotification.autoCloseAfterMs ?? DEFAULT_NOTIFICATION_TIMEOUT,
  };

  setNotifications(notificationsMap);

  return notificationId;
}

function attemptToRemoveExistingNotification(newNotification: NewNotification) {
  if (newNotification.transactionMetadata?.id) {
    const previousNotificationFound = notifications.value.find(
      previousNotification =>
        previousNotification.transactionMetadata?.id ===
        newNotification.transactionMetadata?.id
    );
    if (previousNotificationFound != null) {
      removeNotification(previousNotificationFound.id);
    }
  }
}

function getNotification(id: string) {
  const notificationsMap = getNotifications();

  return notificationsMap[id];
}

function clearAllNotifications() {
  setNotifications({});
}

function updateNotification(id: string, updates: Partial<Notification>) {
  const notificationsMap = getNotifications();
  const notification = getNotification(id);

  if (notification != null) {
    notificationsMap[id] = merge(notification, updates);

    setNotifications(notificationsMap);
  }
}

function removeNotification(id: string) {
  const notificationsMap = getNotifications();

  delete notificationsMap[id];

  setNotifications(notificationsMap);
}

function getNotifications() {
  return notificationsState.value;
}

function setNotifications(notifications: NotificationsMap) {
  notificationsState.value = notifications;
}

const notifications = computed(() =>
  orderBy(Object.values(getNotifications()), 'addedTime', 'desc')
);

export default function useNotifications() {
  return {
    // methods
    addNotification,
    getNotification,
    updateNotification,
    clearAllNotifications,
    removeNotification,

    // computed
    notifications,
  };
}
