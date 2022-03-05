import { computed, Ref, ref } from 'vue';

import { flatten } from 'lodash';

import useGaugesQuery from '@/composables/queries/useGaugesQuery';

export default function useGauges() {
  const gaugesQuery = useGaugesQuery();

  const gauges = computed(() =>
    gaugesQuery.data.value ? flatten(gaugesQuery.data.value) : []
  );

  const isLoadingGauges = computed(
    () => gaugesQuery.isLoading.value || gaugesQuery.isIdle.value
  );

  return {
    gauges,
    isLoadingGauges
  };
}
