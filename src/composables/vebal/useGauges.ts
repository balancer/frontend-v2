import { computed } from 'vue';

import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import { PoolWithGauge } from '@/services/balancer/subgraph/types';

export default function useGauges() {
  const gaugesQuery = useGaugesQuery();

  const poolsWithGauges = computed<PoolWithGauge[]>(() => {
    const g = gaugesQuery.data.value ? gaugesQuery.data.value : [];
    return g;
  });

  const isLoadingGauges = computed<boolean>(() => {
    const isLoading = gaugesQuery.isLoading.value || gaugesQuery.isIdle.value;
    return isLoading;
  });

  return {
    poolsWithGauges,
    isLoadingGauges
  };
}
