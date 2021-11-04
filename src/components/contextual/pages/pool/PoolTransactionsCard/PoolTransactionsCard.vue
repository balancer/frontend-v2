<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FullPool } from '@/services/balancer/subgraph/types';

import Activities from './PoolActivities/Activities.vue';
import Swaps from './PoolSwaps/Swaps.vue';

import { PoolTransactionsTab } from './types';

const { t } = useI18n();

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  loading: boolean;
};

/**
 * PROPS
 */
withDefaults(defineProps<Props>(), {
  loading: false
});

/**
 * STATE
 */
const tabs = [
  {
    value: PoolTransactionsTab.ALL_ACTIVITY,
    label: t('poolTransactions.tabs.allInvestments')
  },
  {
    value: PoolTransactionsTab.SWAPS,
    label: t('poolTransactions.tabs.swaps')
  },
  {
    value: PoolTransactionsTab.USER_ACTIVITY,
    label: t('poolTransactions.tabs.myInvestments')
  }
];

const activeTab = ref(tabs[0].value);
</script>

<template>
  <div
    class="px-4 sm:px-0 flex justify-between items-end border-b dark:border-gray-900 mb-6"
  >
    <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
  </div>
  <Activities
    v-if="activeTab === PoolTransactionsTab.ALL_ACTIVITY"
    :pool-activity-type="PoolTransactionsTab.ALL_ACTIVITY"
    :pool="pool"
    :loading="loading"
  />
  <Activities
    v-else-if="activeTab === PoolTransactionsTab.USER_ACTIVITY"
    :pool-activity-type="PoolTransactionsTab.USER_ACTIVITY"
    :pool="pool"
    :loading="loading"
  />
  <Swaps
    v-else-if="activeTab === PoolTransactionsTab.SWAPS"
    :pool="pool"
    :loading="loading"
  />
</template>
