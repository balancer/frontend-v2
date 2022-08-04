import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import useTokens from '@/composables/useTokens';

export default function useGlobalQueryWatchers() {
  const {
    priceQueryError,
    refetchPrices,
    balancesQueryError,
    refetchBalances,
    allowancesQueryError,
    refetchAllowances,
  } = useTokens();
  const { addAlert, removeAlert } = useAlerts();
  const { t } = useI18n();

  watch(priceQueryError, () => {
    if (priceQueryError.value) {
      addAlert({
        id: 'price-fetch-error',
        label: t('alerts.price-fetch-error'),
        type: AlertType.ERROR,
        persistent: true,
        action: refetchPrices.value,
        actionLabel: t('alerts.retry-label'),
        priority: AlertPriority.MEDIUM,
      });
    } else {
      removeAlert('price-fetch-error');
    }
  });

  watch(balancesQueryError, () => {
    if (balancesQueryError.value) {
      addAlert({
        id: 'balances-fetch-error',
        label: t('alerts.balances-fetch-error'),
        type: AlertType.ERROR,
        persistent: true,
        action: refetchBalances.value,
        actionLabel: t('alerts.retry-label'),
        priority: AlertPriority.MEDIUM,
      });
    } else {
      removeAlert('balances-fetch-error');
    }
  });

  watch(allowancesQueryError, () => {
    if (allowancesQueryError.value) {
      addAlert({
        id: 'allowances-fetch-error',
        label: t('alerts.allowances-fetch-error'),
        type: AlertType.ERROR,
        persistent: true,
        action: refetchAllowances.value,
        actionLabel: t('alerts.retry-label'),
        priority: AlertPriority.MEDIUM,
      });
    } else {
      removeAlert('allowances-fetch-error');
    }
  });
}
