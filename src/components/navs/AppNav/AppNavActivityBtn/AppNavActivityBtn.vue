<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import useBreakpoints from '@/composables/useBreakpoints';
import useNotifications from '@/composables/useNotifications';
import useTransactions from '@/composables/useTransactions';
import { gnosisProtocolService } from '@/services/gnosis/gnosisProtocol.service';
import { signOrderCancellation } from '@/services/gnosis/signing';
import useWeb3 from '@/services/web3/useWeb3';

import ActivityCounter from './ActivityCounter.vue';
import ActivityRows from './ActivityRows.vue';

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint, isMobile } = useBreakpoints();
const { account, getSigner } = useWeb3();
const { t } = useI18n();

const {
  transactions,
  pendingTransactions,
  finalizedTransactions,
  getExplorerLink,
  clearAllTransactions,
  isSuccessfulTransaction,
  updateTransaction,
  isPendingTransactionStatus,
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
        signingScheme,
      },
      owner: account.value,
    });

    updateTransaction(orderId, 'order', {
      status: 'cancelling',
    });
  } catch (e) {
    console.log(e);
    addNotification({
      type: 'error',
      title: t('errorCancellingOrder'),
      message: (e as Error).message,
    });
  }
}
</script>

<template>
  <BalPopover noPad :align="isMobile ? 'left' : undefined">
    <template #activator>
      <BalBtn
        color="white"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        class="relative p-1"
        :circle="upToLargeBreakpoint"
      >
        <ActivityIcon v-if="pendingTransactions.length === 0" />
        <ActivityCounter v-else :count="pendingTransactions.length" />
      </BalBtn>
    </template>
    <BalCard class="w-72" noPad noBorder>
      <template #header>
        <div
          class="flex justify-between items-center p-3 w-full border-b dark:border-gray-900"
        >
          <h5>{{ $t('recentActivityTitle') }}</h5>
        </div>
      </template>
      <div :class="['p-3', { 'h-72 overflow-auto': transactions.length > 5 }]">
        <template v-if="transactions.length > 0">
          <ActivityRows
            :transactions="pendingTransactions"
            :getExplorerLink="getExplorerLink"
            :isSuccessfulTransaction="isSuccessfulTransaction"
            :isPendingTransactionStatus="isPendingTransactionStatus"
            :cancelOrder="cancelOrder"
          />
          <div
            v-if="
              pendingTransactions.length > 0 && finalizedTransactions.length > 0
            "
            class="my-3 h-px bg-gray-100 dark:bg-gray-700"
          />
          <ActivityRows
            :transactions="finalizedTransactions"
            :getExplorerLink="getExplorerLink"
            :isSuccessfulTransaction="isSuccessfulTransaction"
            :isPendingTransactionStatus="isPendingTransactionStatus"
            :cancelOrder="cancelOrder"
          />
        </template>
        <template v-else>
          {{ $t('noRecentActivity') }}
        </template>
      </div>
      <template v-if="transactions.length > 0" #footer>
        <div class="p-3 w-full text-sm bg-white dark:bg-gray-800 rounded-b-lg">
          <a class="text-blue-500" @click="clearAllTransactions()">
            {{ $t('clearTransactions') }}
          </a>
        </div>
      </template>
    </BalCard>
  </BalPopover>
</template>


