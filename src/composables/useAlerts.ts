import { computed, ref } from 'vue';
import { orderBy } from 'lodash';

export enum AlertType {
  ERROR = 'error',
  INFO = 'info',
  FEATURE = 'feature'
}

export enum AlertPriority {
  LOW,
  MEDIUM,
  HIGH
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
  alertsState.value[alert.id] = {
    ...alert,
    priority: alert.priority ?? AlertPriority.LOW
  };
}

function removeAlert(alertId: string) {
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
    removeAllAlerts
  };
}
