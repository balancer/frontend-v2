import { computed } from 'vue';
import useBeethovenxConfigQuery from '@/beethovenx/composables/queries/useBeethovenxConfigQuery';
import { GqlBeetsConfig } from '@/beethovenx/services/beethovenx/beethovenx-types';

export default function useBeethovenxConfig() {
  const beethovenxConfigQuery = useBeethovenxConfigQuery();

  const beethovenxConfigLoading = computed(
    () =>
      beethovenxConfigQuery.isLoading.value ||
      beethovenxConfigQuery.isIdle.value
  );

  const beethovenxConfig = computed(
    (): GqlBeetsConfig =>
      beethovenxConfigQuery.data.value
        ? beethovenxConfigQuery.data.value
        : {
            incentivizedPools: [],
            blacklistedPools: [],
            pausedPools: [],
            featuredPools: [],
            homeFeaturedPools: [],
            homeNewsItems: [],
            poolFilters: [],
            homeEducationItems: [],
            blacklistedTokens: [],
            boostedPools: []
          }
  );

  return {
    beethovenxConfigLoading,
    beethovenxConfig
  };
}
