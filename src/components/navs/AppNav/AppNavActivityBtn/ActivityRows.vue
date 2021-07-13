<template>
  <div>
    <div v-for="transaction in transactions" :key="transaction.id" class="row">
      <BalLink
        :href="getExplorerLink(transaction.id, transaction.type)"
        external
        noStyle
      >
        <div class="font-semibold">
          {{ $t(`recentActivityTypes.${transaction.action}`) }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ transaction.summary }}
        </div>
      </BalLink>
      <div>
        <CheckIcon
          v-if="transaction.status === 'confirmed'"
          class="text-green-500"
        />
        <SpinnerIcon v-else class="animate-spin text-yellow-500" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { Transaction } from '@/composables/useTransactions';

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
    }
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
</style>
