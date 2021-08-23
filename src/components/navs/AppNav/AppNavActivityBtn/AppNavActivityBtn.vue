<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        color="white"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        class="mr-2 p-1 relative"
        :circle="upToLargeBreakpoint"
      >
        <ActivityIcon v-if="pendingTransactions.length === 0" />
        <ActivityCounter v-else :count="pendingTransactions.length" />
      </BalBtn>
    </template>
    <BalCard class="w-72" noPad noBorder>
      <template v-slot:header>
        <div
          class="p-3 w-full flex items-center justify-between border-b dark:border-gray-900"
        >
          <h5>{{ $t('recentActivityTitle') }}</h5>
        </div>
      </template>
      <div :class="['p-3', { 'h-72 overflow-auto': transactions.length > 5 }]">
        <template v-if="transactions.length > 0">
          <ActivityRows
            :transactions="unconfirmedTransactions"
            :get-explorer-link="getExplorerLink"
            :is-successful-transaction="isSuccessfulTransaction"
          />
          <div
            v-if="
              unconfirmedTransactions.length > 0 &&
                confirmedTransactions.length > 0
            "
            class="bg-gray-100 dark:bg-gray-700 my-3 h-px"
          />
          <ActivityRows
            :transactions="confirmedTransactions"
            :get-explorer-link="getExplorerLink"
            :is-successful-transaction="isSuccessfulTransaction"
          />
        </template>
        <template v-else>{{ $t('noRecentActivity') }}</template>
      </div>
      <template v-if="transactions.length > 0" v-slot:footer>
        <div class="w-full p-3 rounded-b-lg bg-white dark:bg-gray-800 text-sm">
          <a @click="clearAllTransactions()" class="text-blue-500">
            {{ $t('clearTransactions') }}
          </a>
        </div>
      </template>
    </BalCard>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';

import ActivityCounter from './ActivityCounter.vue';
import ActivityRows from './ActivityRows.vue';

export default defineComponent({
  name: 'AppNavActivityBtn',

  components: {
    ActivityCounter,
    ActivityRows
  },

  setup() {
    // COMPOSABLES
    const { upToLargeBreakpoint } = useBreakpoints();
    const { isLoadingProfile, profile, account } = useWeb3();
    const {
      transactions,
      pendingTransactions,
      getExplorerLink,
      clearAllTransactions,
      isSuccessfulTransaction
    } = useTransactions();

    // COMPUTED
    const unconfirmedTransactions = computed(() =>
      transactions.value.filter(({ status }) => status !== 'confirmed')
    );

    const confirmedTransactions = computed(() =>
      transactions.value.filter(({ status }) => status === 'confirmed')
    );

    return {
      // methods
      clearAllTransactions,
      getExplorerLink,
      isSuccessfulTransaction,

      // computed
      account,
      profile,
      upToLargeBreakpoint,
      isLoadingProfile,
      transactions,
      pendingTransactions,
      unconfirmedTransactions,
      confirmedTransactions
    };
  }
});
</script>
