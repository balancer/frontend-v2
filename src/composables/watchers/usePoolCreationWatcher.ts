import { lsGet } from '@/lib/utils';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import usePoolCreation, {
  POOL_CREATION_STATE_KEY,
  POOL_CREATION_STATE_VERSION
} from '../pools/usePoolCreation';
import useAlerts, { AlertPriority, AlertType } from '../useAlerts';

export default function usePoolCreationWatcher() {
  const { needsSeeding } = usePoolCreation();
  const { addAlert } = useAlerts();
  const { t } = useI18n();
  const router = useRouter();

  function navigateToPoolCreation() {
    router.push({ name: 'create-pool' });
  }

  onMounted(() => {
    const previouslySavedState = lsGet(
      POOL_CREATION_STATE_KEY,
      null,
      POOL_CREATION_STATE_VERSION
    );
    if (previouslySavedState) {
      addAlert({
        id: 'return-to-pool-creation',
        label: needsSeeding.value
          ? t('finishSeedingPoolAlert')
          : t('finishCreatingPoolAlert'),
        type: AlertType.ERROR,
        persistent: false,
        action: navigateToPoolCreation,
        actionLabel: t('returnToPoolCreation'),
        priority: AlertPriority.LOW
      });
    }
  });
}
