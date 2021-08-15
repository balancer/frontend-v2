<template>
  <div>
    <div v-for="transaction in transactions" :key="transaction.id" class="row">
      <BalLink
        :href="getExplorerLink(transaction.id, transaction.type)"
        :disabled="disablePending && transaction.status === 'pending'"
        external
        noStyle
        class="group"
      >
        <div class="font-semibold flex items-center">
          {{ $t(`transactionAction.${transaction.action}`) }}
          <BalIcon
            v-if="!(disablePending && transaction.status === 'pending')"
            name="arrow-up-right"
            size="sm"
            class="ml-1 text-gray-400 dark:text-gray-600 group-hover:text-pink-500 transition-colors"
          />
        </div>
        <div
          class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors summary"
        >
          {{ transaction.summary }}
        </div>
      </BalLink>
      <div>
        <template v-if="transaction.status === 'confirmed'">
          <CheckIcon
            v-if="isSuccessfulTransaction(transaction)"
            class="text-green-500"
          />
          <BalIcon v-else name="alert-circle" class="text-red-500" />
        </template>
        <SpinnerIcon v-else class="animate-spin text-yellow-500" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { Transaction } from '@/composables/useTransactions';
import useWeb3 from '@/services/web3/useWeb3';

export default defineComponent({
  name: 'ActivityRows',

  props: {
    transactions: {
      type: Array as PropType<Transaction[]>,
      required: true
    },
    getExplorerLink: {
      type: Function as PropType<
        (id: string, type: Transaction['type']) => void
      >,
      required: true
    },
    isSuccessfulTransaction: {
      type: Function as PropType<(transaction: Transaction) => boolean>,
      required: true
    }
  },

  setup() {
    const { connector } = useWeb3();

    const disablePending = computed(() => connector.value?.id === 'gnosis');
    return {
      disablePending
    };
  }
});
</script>
<style scoped>
.row {
  @apply flex justify-between items-center mb-3;
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
</style>
