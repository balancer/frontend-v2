<script setup lang="ts">
import { computed } from 'vue';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import { TokenInfo } from '@/types/TokenList';
// Composables
import useTokens from '@/composables/useTokens';
import useConfig from '@/composables/useConfig';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
};

/**
 * Props
 */
const props = withDefaults(defineProps<Props>(), {});

/**
 * STATE
 */

/**
 * COMPOSABLES
 */

const { usdAsset } = usePoolTransfers();
const { getTokens, getToken } = useTokens();
const { networkConfig } = useConfig();

/**
 * COMPUTED
 */

const usdWeight = computed(() => {
  const usdToken = props.pool.tokens.find(
    token =>
      token.address.toLowerCase() ===
      networkConfig.addresses.bbUsd.toLowerCase()
  );

  return usdToken?.weight ? parseFloat(usdToken.weight) * 100 : undefined;
});

const tokens = computed(() => getTokens(networkConfig.usdTokens));
const options = computed(() => networkConfig.usdTokens);
const selectedToken = computed((): TokenInfo => getToken(usdAsset.value));

/**
 * METHODS
 */
function handleSelected(newToken: string): void {
  usdAsset.value = newToken;
}
</script>

<template>
  <BalDropdown :options="options" minWidth="44" @selected="handleSelected">
    <template #activator>
      <div class="token-select-input selected group selectable select-none">
        <div>
          <BalAsset :address="selectedToken.address" class="shadow mr-2" />
        </div>
        <span class="text-base font-medium">
          <span>{{ selectedToken.symbol }}</span>
          <span v-if="usdWeight" class="ml-1">{{ usdWeight }}%</span>
        </span>
        <BalIcon
          v-if="options.length > 1"
          name="chevron-down"
          size="sm"
          class="text-green-500 group-hover:text-pink-500 ml-2"
        />
      </div>
    </template>
    <template #option="{ option }">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <BalAsset :address="option" class="mr-2" />
          {{ tokens[option]?.symbol }}
        </div>
        <BalIcon
          v-if="usdAsset === option"
          name="check"
          class="text-green-500 ml-2"
        />
      </div>
    </template>
  </BalDropdown>
</template>

<style scoped>
.token-select-input {
  @apply shadow rounded-lg flex items-center h-10 px-2 whitespace-nowrap;
  @apply text-sm;
  font-variation-settings: 'wght' 700;
}

.selectable {
  @apply cursor-pointer hover:shadow-none transition-shadow;
}

.selected {
  @apply bg-gray-50 dark:bg-gray-700 text-black dark:text-white;
}
</style>
