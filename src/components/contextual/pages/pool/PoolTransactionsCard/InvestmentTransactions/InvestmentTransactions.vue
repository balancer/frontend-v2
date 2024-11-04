<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { Pool } from '@/services/pool/types';

// import BoostedActivities from '../BoostedPoolActivities/Activities.vue';
import Activities from '../PoolActivities/Activities.vue';
import { PoolTransactionsTab } from '../types';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading: boolean;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

/**
 * COMPOSABLES
 */
const { isWalletReady } = useWeb3();

/**
 * COMPUTED
 */
const tabs = computed(() =>
  isDeepPool.value || isStablePhantomPool.value
    ? [
        {
          value: PoolTransactionsTab.ALL_ACTIVITY,
          label: t('poolTransactions.tabs.allTransactions'),
        },
        ...(isWalletReady.value
          ? [
              {
                value: PoolTransactionsTab.USER_ACTIVITY,
                label: t('poolTransactions.tabs.myTransactions'),
              },
            ]
          : []),
      ]
    : [
        {
          value: PoolTransactionsTab.ALL_ACTIVITY,
          label: t('poolTransactions.tabs.allInvestments'),
        },
        ...(isWalletReady.value
          ? [
              {
                value: PoolTransactionsTab.USER_ACTIVITY,
                label: t('poolTransactions.tabs.myInvestments'),
              },
            ]
          : []),
      ]
);

/**
 * COMPOSABLES
 */
const { isDeepPool, isStablePhantomPool } = usePoolHelpers(
  toRef(props, 'pool')
);
const { t } = useI18n();

/**
 * STATE
 */
const activeTab = ref(tabs.value[0].value);

/**
 * COMPUTED
 */
const title = computed((): string => {
  if (isDeepPool.value || isStablePhantomPool.value) return t('poolActivity');

  return t('liquidityProvision');
});
</script>

<template>
  <div class="mb-5">
    <div>
      <h3 class="px-4 lg:px-0 mb-3" v-text="title" />
      <div
        class="flex justify-between items-end mx-4 lg:mx-0 mb-6 border-b dark:border-gray-900"
      >
        <BalTabs v-model="activeTab" :tabs="tabs" noPad class="-mb-px" />
      </div>
    </div>
    <div class="mb-20">
      <Activities
        v-if="activeTab === PoolTransactionsTab.ALL_ACTIVITY"
        :poolActivityType="PoolTransactionsTab.ALL_ACTIVITY"
        :pool="pool"
        :loading="loading"
      />
      <Activities
        v-else-if="activeTab === PoolTransactionsTab.USER_ACTIVITY"
        :poolActivityType="PoolTransactionsTab.USER_ACTIVITY"
        :pool="pool"
        :loading="loading"
      />
    </div>
  </div>
</template>
