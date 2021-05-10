<template>
  <div class="flex justify-between items-end border-b mb-6">
    <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
  </div>
  <template v-if="activeTab === PoolActivityTab.ALL_ACTIVITY">
    <Activities
      :pool-activity-type="PoolActivityTab.ALL_ACTIVITY"
      :pool="pool"
      :loading="loading"
    />
  </template>
  <template v-if="activeTab === PoolActivityTab.USER_ACTIVITY">
    <Activities
      :pool-activity-type="PoolActivityTab.USER_ACTIVITY"
      :pool="pool"
      :loading="loading"
    />
  </template>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FullPool } from '@/services/balancer/subgraph/types';

import Activities from './Activities.vue';

import { PoolActivityTab } from './types';

export default defineComponent({
  components: {
    Activities
  },

  props: {
    pool: {
      type: Object as PropType<FullPool>,
      required: true
    },
    loading: { type: Boolean, default: false }
  },

  setup() {
    // COMPOSABLES
    const { t } = useI18n();

    // DATA
    const tabs = [
      { value: PoolActivityTab.ALL_ACTIVITY, label: t('allTransactions') },
      { value: PoolActivityTab.USER_ACTIVITY, label: t('myTransactions') }
    ];
    const activeTab = ref(tabs[0].value);

    return {
      // data
      tabs,
      activeTab,
      PoolActivityTab
    };
  }
});
</script>
