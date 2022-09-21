<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePool } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';

import BoostedActivities from '../BoostedPoolActivities/Activities.vue';
import Activities from '../PoolActivities/Activities.vue';
import { PoolTransactionsTab } from '../types';

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
 * COMPUTED
 */
const tabs = computed(() =>
  isComposableStableLikePool.value
    ? [
        {
          value: PoolTransactionsTab.ALL_ACTIVITY,
          label: t('poolTransactions.tabs.allTransactions'),
        },
        {
          value: PoolTransactionsTab.USER_ACTIVITY,
          label: t('poolTransactions.tabs.myTransactions'),
        },
      ]
    : [
        {
          value: PoolTransactionsTab.ALL_ACTIVITY,
          label: t('poolTransactions.tabs.allInvestments'),
        },
        {
          value: PoolTransactionsTab.USER_ACTIVITY,
          label: t('poolTransactions.tabs.myInvestments'),
        },
      ]
);

/**
 * COMPOSABLES
 */
const { isComposableStableLikePool } = usePool(toRef(props, 'pool'));
const { t } = useI18n();

/**
 * STATE
 */
const activeTab = ref(tabs.value[0].value);
</script>

<template>
  <div>
    <div>
      <h4
        class="px-4 lg:px-0 mb-5"
        v-text="$t('poolTransactions.tabs.allInvestments')"
      />
      <div
        class="flex justify-between items-end mx-4 lg:mx-0 mb-6 border-b dark:border-gray-900"
      >
        <BalTabs v-model="activeTab" :tabs="tabs" noPad class="-mb-px" />
      </div>
    </div>

    <template v-if="isComposableStableLikePool">
      <BoostedActivities
        v-if="activeTab === PoolTransactionsTab.ALL_ACTIVITY"
        :poolActivityType="PoolTransactionsTab.ALL_ACTIVITY"
        :pool="pool"
        :loading="loading"
      />
      <BoostedActivities
        v-else-if="activeTab === PoolTransactionsTab.USER_ACTIVITY"
        :poolActivityType="PoolTransactionsTab.USER_ACTIVITY"
        :pool="pool"
        :loading="loading"
      />
    </template>
    <template v-else>
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
    </template>
  </div>
</template>
