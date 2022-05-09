<script setup lang="ts">
import flatten from 'lodash/flatten';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import PoolStatInfo from '@/components/contextual/pages/pool/PoolStatInfo.vue';
import usePoolTransactionStats from '@/composables/pools/usePoolTransactionStats';
import usePoolActivitiesQuery from '@/composables/queries/usePoolActivitiesQuery';
import usePoolUserActivitiesQuery from '@/composables/queries/usePoolUserActivitiesQuery';
import { usePool } from '@/composables/usePool';
import { FullPool } from '@/services/balancer/subgraph/types';

import BoostedActivities from '../BoostedPoolActivities/Activities.vue';
import Activities from '../PoolActivities/Activities.vue';
import { PoolTransactionsTab } from '../types';

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
 * COMPUTED
 */
const poolActivities = computed(() =>
  poolActivitiesQuery.data.value
    ? flatten(
        poolActivitiesQuery.data.value.pages.map(page => page.poolActivities)
      )
    : []
);
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
          value: PoolTransactionsTab.USER_ACTIVITY,
          label: t('poolTransactions.tabs.myInvestments')
        }
      ]
);

/**
 * COMPOSABLES
 */
const { isStablePhantomPool } = usePool(toRef(props, 'pool'));
const { t } = useI18n();
const { investTransactionStats } = usePoolTransactionStats(
  computed(() => props.pool),
  poolActivities
);
const route = useRoute();

/**
 * STATE
 */
const activeTab = ref(tabs.value[0].value);
const id = route.params.id as string;

/**
 * QUERIES
 */
const poolActivitiesQuery =
  activeTab.value === PoolTransactionsTab.ALL_ACTIVITY
    ? usePoolActivitiesQuery(id)
    : usePoolUserActivitiesQuery(id);
</script>

<template>
  <div>
    <h4
      v-text="$t('poolTransactions.tabs.allInvestments')"
      class="px-4 lg:px-0 mb-5"
    />
    <PoolStatInfo :stats="investTransactionStats" />
    <div
      class="px-4 sm:px-0 flex justify-between items-end border-b dark:border-gray-900 mb-6"
    >
      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
    </div>
  </div>

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
    </div>
  </template>
</template>
