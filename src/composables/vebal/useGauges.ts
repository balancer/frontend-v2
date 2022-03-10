import { computed, Ref, ref } from 'vue';

import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import { PoolWithGauge } from '@/services/balancer/subgraph/types';

export default function useGauges() {
  const gaugesQuery = useGaugesQuery();

  const gauges = computed((): PoolWithGauge[] => {
    const g = gaugesQuery.data.value ? gaugesQuery.data.value : [];
    console.log('Recomputing gauges to be: ', g);
    return g;
  });

  const isLoadingGauges = computed(() => {
    const isLoading = gaugesQuery.isLoading.value || gaugesQuery.isIdle.value;
    console.log('Is loading: ', isLoading);
    return isLoading;
  });

  return {
    gauges,
    isLoadingGauges
  };
}
