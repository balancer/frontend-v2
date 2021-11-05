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
            :transactions="pendingTransactions"
            :get-explorer-link="getExplorerLink"
            :is-successful-transaction="isSuccessfulTransaction"
            :is-pending-transaction-status="isPendingTransactionStatus"
            :cancel-order="cancelOrder"
          />
          <div
            v-if="
              pendingTransactions.length > 0 && finalizedTransactions.length > 0
            "
            class="bg-gray-100 dark:bg-gray-700 my-3 h-px"
          />
          <ActivityRows
            :transactions="finalizedTransactions"
            :get-explorer-link="getExplorerLink"
            :is-successful-transaction="isSuccessfulTransaction"
            :is-pending-transaction-status="isPendingTransactionStatus"
            :cancel-order="cancelOrder"
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
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import useBreakpoints from '@/composables/useBreakpoints';
import useTransactions from '@/composables/useTransactions';
import useNotifications from '@/composables/useNotifications';

import useWeb3 from '@/services/web3/useWeb3';
import { signOrderCancellation } from '@/services/gnosis/signing';
import { gnosisProtocolService } from '@/services/gnosis/gnosisProtocol.service';

import ActivityCounter from './ActivityCounter.vue';
import ActivityRows from './ActivityRows.vue';

export default defineComponent({
  name: 'AppNavActivityBtn',

  components: {
    ActivityCounter,
    ActivityRows
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { upToLargeBreakpoint } = useBreakpoints();
    const { isLoadingProfile, profile, account, getSigner } = useWeb3();
    const { t } = useI18n();

    const {
      transactions,
      pendingTransactions,
      finalizedTransactions,
      getExplorerLink,
      clearAllTransactions,
      isSuccessfulTransaction,
      updateTransaction,
      isPendingTransactionStatus
    } = useTransactions();

    const { addNotification } = useNotifications();

    /**
     * METHODS
     */
    async function cancelOrder(orderId: string) {
      try {
        const { signature, signingScheme } = await signOrderCancellation(
          orderId,
          getSigner()
        );

        await gnosisProtocolService.sendSignedOrderCancellation({
          cancellation: {
            orderUid: orderId,
            signature,
            signingScheme
          },
          owner: account.value
        });

        updateTransaction(orderId, 'order', {
          status: 'cancelling'
        });
      } catch (e) {
        console.log(e);
        addNotification({
          type: 'error',
          title: t('errorCancellingOrder'),
          message: (e as Error).message
        });
      }
    }

    return {
      // methods
      clearAllTransactions,
      getExplorerLink,
      isSuccessfulTransaction,
      isPendingTransactionStatus,
      cancelOrder,

      // computed
      account,
      profile,
      upToLargeBreakpoint,
      isLoadingProfile,
      transactions,
      pendingTransactions,
      finalizedTransactions
    };
  }
});
</script>
