<script setup lang="ts">
import { computed } from 'vue';

import { Transaction } from '@/composables/useTransactions';
import useWeb3 from '@/services/web3/useWeb3';

interface Props {
  transactions: Transaction[];
  getExplorerLink: (id: string, type: Transaction['type']) => void;
  cancelOrder: (orderId: string) => void;
  isSuccessfulTransaction: (transaction: Transaction) => boolean;
  isPendingTransactionStatus: (transaction: Transaction['status']) => boolean;
}

defineProps<Props>();

/**
 * COMPOSABLES
 */
const { connector } = useWeb3();

/**
 * COMPUTED
 */
const disablePending = computed(() => connector.value?.id === 'gnosis');
</script>

<template>
  <div>
    <div v-for="transaction in transactions" :key="transaction.id" class="mb-3">
      <div class="row">
        <BalLink
          :href="getExplorerLink(transaction.id, transaction.type)"
          :disabled="
            disablePending && isPendingTransactionStatus(transaction.status)
          "
          external
          noStyle
          class="group"
        >
          <div class="flex items-center font-semibold">
            {{ $t(`transactionAction.${transaction.action}`) }}
            <BalIcon
              v-if="
                !(
                  disablePending &&
                  isPendingTransactionStatus(transaction.status)
                )
              "
              name="arrow-up-right"
              size="sm"
              class="ml-1 text-gray-400 group-hover:text-pink-500 dark:text-gray-600 transition-colors"
            />
          </div>
          <div
            class="text-sm group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white transition-colors text-secondary summary"
          >
            {{ transaction.summary }}
          </div>
        </BalLink>
        <div>
          <SpinnerIcon
            v-if="isPendingTransactionStatus(transaction.status)"
            class="text-orange-500 animate-spin"
          />
          <template v-else>
            <CheckIcon
              v-if="isSuccessfulTransaction(transaction)"
              class="text-green-500"
            />
            <BalTooltip v-else class="cursor-default">
              <template #activator>
                <BalIcon name="alert-circle" class="text-red-500" />
              </template>
              <div class="failed-reason-tooltip">
                {{ $t(`transactionAction.${transaction.action}`) }}
                {{ $t(`transactionStatus.${transaction.status}`) }}
              </div>
            </BalTooltip>
          </template>
        </div>
      </div>
      <div
        v-if="
          transaction.type === 'order' &&
          isPendingTransactionStatus(transaction.status)
        "
        class="mt-1"
      >
        <BalBtn
          size="xs"
          :label="$t('cancel')"
          :loading="transaction.status === 'cancelling'"
          :loadingLabel="$t('cancelling')"
          color="white"
          @click.prevent="cancelOrder(transaction.id)"
        />
      </div>
    </div>
  </div>
</template>


<style scoped>
.row {
  @apply flex justify-between items-center;
}

.row:last-child {
  @apply mb-0;
}

.summary {
  @apply overflow-hidden;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.failed-reason-tooltip {
  @apply lowercase;
}

.failed-reason-tooltip::first-letter {
  @apply uppercase;
}
</style>
