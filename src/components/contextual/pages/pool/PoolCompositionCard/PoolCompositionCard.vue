<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import { removeBptFrom } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';
import { computed, nextTick, onMounted, ref, toRefs } from 'vue';

import { isWeightedLike } from '@/composables/usePool';
import { useUserPoolPercentage } from '@/composables/useUserPoolPercentage';
import { useI18n } from 'vue-i18n';
import TokenBreakdown from './components/TokenBreakdown.vue';
import { useTokenBreakdown } from './components/composables/useTokenBreakdown';
import PercentagePill from './components/PercentagePill.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();
const { pool } = toRefs(props);
const isWeighted = isWeightedLike(pool.value.poolType);

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const { userPoolPercentage, userPoolPercentageLabel } =
  useUserPoolPercentage(pool);
const { t } = useI18n();
const rootPool = computed(() => removeBptFrom(pool.value));
const tokenData = useTokenBreakdown(rootPool);

/**
 * STATE
 */
const TOTAL_COMPOSITION = 'TOTAL_COMPOSITION';
const MY_POOL_SHARE = 'MY_POOL_SHARE';

const compositionTab = {
  value: TOTAL_COMPOSITION,
  label: t('poolComposition.tabs.totalComposition'),
};
const mySharesTab = {
  value: MY_POOL_SHARE,
  label: t('poolComposition.tabs.myPoolShare'),
};
const activeTab = ref(TOTAL_COMPOSITION);

/**
 * COMPUTED
 */
const userHasShares = computed(() => userPoolPercentage.value.gt(0));
// Hide my pool share tab when user does not have shares
const tabs = computed(() =>
  userHasShares.value ? [compositionTab, mySharesTab] : [compositionTab]
);
const showUserShares = computed(() => activeTab.value === MY_POOL_SHARE);

/**
 * LIFECYCLE
 */
onMounted(async () => {
  await nextTick();

  if (userHasShares.value) {
    activeTab.value = MY_POOL_SHARE;
  }
});
</script>

<template>
  <div
    class="flex justify-start items-center mx-4 lg:mx-0 mb-6 border-b dark:border-gray-900"
  >
    <BalTabs v-model="activeTab" :tabs="tabs" noPad class="-mb-px">
      <PercentagePill v-if="userHasShares" :isActive="showUserShares">
        {{ userPoolPercentageLabel }}
      </PercentagePill>
    </BalTabs>
  </div>
  <BalCard
    class="overflow-x-auto whitespace-nowrap"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <template #header>
      <div
        class="grid p-4 w-full text-base font-semibold border-b dark:border-gray-900"
        :class="[isWeighted ? 'grid-cols-5' : 'grid-cols-4']"
      >
        <div>{{ $t('token') }}</div>
        <div v-if="isWeighted" class="justify-self-end">
          {{ $t('weight') }}
        </div>
        <div class="justify-self-end">
          {{ $t('balance') }}
        </div>
        <div class="justify-self-end">
          {{ $t('value') }}
        </div>
        <div class="justify-self-end">
          {{ $t('poolComposition.token%') }}
        </div>
      </div>
    </template>

    <div class="grid gap-y-4 py-4">
      <div
        v-for="token in rootPool.tokens"
        :key="token.address"
        class="grid gap-y-4"
      >
        <TokenBreakdown
          :token="token"
          :showUserShares="showUserShares"
          :rootPool="pool"
          :tokensData="tokenData"
        />
      </div>
    </div>
  </BalCard>
</template>
