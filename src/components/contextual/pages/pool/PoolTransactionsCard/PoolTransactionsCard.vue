<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePool } from '@/composables/usePool';
import { FullPool } from '@/services/balancer/subgraph/types';

import BoostedActivities from './BoostedPoolActivities/Activities.vue';
import Activities from './PoolActivities/Activities.vue';
import Swaps from './PoolSwaps/Swaps.vue';
import { PoolTransactionsTab } from './types';

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
const props = withDefaults(defineProps<Props>(), {
  loading: false
});

/**
 * COMPOSABLES
 */
const { isStablePhantomPool } = usePool(toRef(props, 'pool'));
const { t } = useI18n();

/**
 * COMPUTED
 */
const tabs = computed(() =>
  isStablePhantomPool.value
    ? [
        {
          value: PoolTransactionsTab.ALL_ACTIVITY,
          label: t('poolTransactions.tabs.allTransactions')
        },
        {
          value: PoolTransactionsTab.USER_ACTIVITY,
          label: t('poolTransactions.tabs.myTransactions')
        }
      ]
    : [
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
      ]
);

/**
 * STATE
 */
const activeTab = ref(tabs.value[0].value);
</script>

<template>
  <template v-if="isStablePhantomPool">
    <BoostedActivities
      v-if="activeTab === PoolTransactionsTab.ALL_ACTIVITY"
      :pool-activity-type="PoolTransactionsTab.ALL_ACTIVITY"
      :pool="pool"
      :loading="loading"
    />
    <BoostedActivities
      v-else-if="activeTab === PoolTransactionsTab.USER_ACTIVITY"
      :pool-activity-type="PoolTransactionsTab.USER_ACTIVITY"
      :pool="pool"
      :loading="loading"
    />
  </template>
  <template v-else>
    <div class="mb-20">
      <h4
        v-text="$t('poolTransactions.tabs.allInvestments')"
        class="px-4 lg:px-0 mb-5"
      />
      <Activities
        :pool-activity-type="PoolTransactionsTab.ALL_ACTIVITY"
        :pool="pool"
        :loading="loading"
      />
    </div>
    <div class="mb-20">
      <h4 v-text="$t('Trades')" class="px-4 lg:px-0 mb-5" />

      <Swaps v-if="pool" :pool="pool" :loading="loading" />
    </div>

    <div>
      <h4
        v-text="$t('poolTransactions.tabs.myInvestments')"
        class="px-4 lg:px-0 mb-5"
      />
      <Activities
        :pool-activity-type="PoolTransactionsTab.USER_ACTIVITY"
        :pool="pool"
        :loading="loading"
      />
    </div>
  </template>
</template>
