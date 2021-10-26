<script setup lang="ts">
import { toRef, onBeforeMount, computed } from 'vue';
import useWithdrawMath from '@/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  missingPrices: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const {
  fiatTotalLabel,
  initMath,
  proportionalAmounts,
  hasBpt
} = useWithdrawMath(toRef(props, 'pool'));
const { getTokens } = useTokens();
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const tokens = computed(() => getTokens(props.pool.tokenAddresses));

/**
 * METHODS
 */
function weightLabelFor(address: string): string {
  return fNum(props.pool.onchain.tokens[address].weight, 'percent_lg');
}

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  initMath();
});
</script>

<template>
  <BalCard noPad>
    <template #header>
      <div class="card-header">
        <h5>
          {{ $t('poolTransfer.myPoolBalancesCard.title') }}
        </h5>
        <h5>
          {{ fiatTotalLabel }}
        </h5>
      </div>
    </template>
    <div class="px-4 py-2">
      <div
        v-for="(token, _, index) in tokens"
        :key="token.address"
        class="asset-row"
      >
        <div class="flex items-center">
          <BalAsset :address="token.address" :size="36" class="mr-4" />
          {{ weightLabelFor(token.address) }}
          {{ token.symbol }}
        </div>

        <span class="flex-grow text-right">
          {{ fNum(proportionalAmounts[index], 'token') }}
        </span>
      </div>
    </div>
    <div :class="['px-4 pb-4 pt-1', { 'grid gap-2 grid-cols-2': hasBpt }]">
      <BalBtn
        tag="router-link"
        :to="{ name: 'invest' }"
        :label="$t('investInPool')"
        color="gradient"
        block
      />
      <BalBtn
        v-if="hasBpt"
        tag="router-link"
        :to="{ name: 'withdraw' }"
        :label="$t('withdraw.label')"
        block
      />
    </div>
  </BalCard>
</template>

<style scoped>
.card-header {
  @apply p-4 w-full flex items-center justify-between;
  @apply border-b dark:border-gray-700;
}

.asset-row {
  @apply py-3 flex justify-between items-center text-lg;
}
</style>
