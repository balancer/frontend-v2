import { computed } from 'vue';

import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import { PoolWithGauge } from '@/services/balancer/subgraph/types';

export default function useGauges() {
  // const gaugesQuery = useGaugesQuery();
  const {
    data: gaugesData,
    isLoading: gaugesLoading,
    isIdle: gaugesIdle,
    refetch: refetchGauges
  } = useGaugesQuery();

  const poolsWithGauges = computed<PoolWithGauge[]>(() => {
    const g = gaugesData.value ? gaugesData.value : [];
    return g;
  });

  const isLoadingGauges = computed<boolean>(() => {
    const isLoading = gaugesLoading.value || gaugesIdle.value;
    return isLoading;
  });

  return {
    poolsWithGauges,
    isLoadingGauges,
    refetchGauges
  };
}
