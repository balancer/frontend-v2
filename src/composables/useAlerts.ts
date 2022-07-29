import { orderBy } from 'lodash';
import { computed, ref } from 'vue';

import { lsGet, lsSet } from '@/lib/utils';

export enum AlertType {
  ERROR = 'error',
  INFO = 'info',
  FEATURE = 'feature',
}

export enum AlertPriority {
  LOW,
  MEDIUM,
  HIGH,
}

export type Alert = {
  id: string;
  priority?: AlertPriority;
  label: string;
  type: AlertType;
  actionLabel?: string;
  action?: () => void;
  actionOnClick?: boolean;
  persistent?: boolean;
  rememberClose?: boolean;
};

export const alertsState = ref<Record<string, Alert>>({});

/**
 * COMPUTED
 */
const alerts = computed(() =>
  Object.values(orderBy(alertsState.value, 'priority', 'desc'))
);
const currentAlert = computed(() =>
  alerts.value.length > 0 ? alerts.value[0] : null
);

/**
 * METHODS
 */
function addAlert(alert: Alert) {
  const wasClosed = lsGet(`alerts.${alert.id}.closed`);
  if (wasClosed && alert?.rememberClose) return;

  alertsState.value[alert.id] = {
    ...alert,
    priority: alert.priority ?? AlertPriority.LOW,
  };
}

function removeAlert(alertId: string) {
  const alert = alertsState.value[alertId];
  if (alert?.rememberClose) lsSet(`alerts.${alertId}.closed`, true);

  delete alertsState.value[alertId];
}

function removeAllAlerts() {
  alertsState.value = {};
}

export default function useAlerts() {
  return {
    // computed
    alerts,
    currentAlert,

    // methods
    addAlert,
    removeAlert,
    removeAllAlerts,
  };
}
