<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import { usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { isSameAddress } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import useWithdrawalState from '../composables/useWithdrawalState';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  initToken?: string;
};

/**
 * Props
 */
const props = withDefaults(defineProps<Props>(), {
  initToken: 'all',
});

/**
 * STATE
 */
const selectedOption = ref(props.initToken);

/**
 * COMPOSABLES
 */
const { getToken, nativeAsset } = useTokens();
const { isProportional, tokenOut } = useWithdrawalState(toRef(props, 'pool'));
const { isWethPool, isDeepPool } = usePool(toRef(props, 'pool'));

/**
 * COMPUTED
 */
const tokenAddresses = computed(() => {
  if (isDeepPool.value) return props.pool?.mainTokens || [];
  if (isWethPool.value) return [nativeAsset.address, ...props.pool.tokensList];
  return props.pool.tokensList;
});

const options = computed(() => {
  return ['all', ...tokenAddresses.value];
});

const selectedToken = computed((): TokenInfo => getToken(selectedOption.value));

const assetSetWidth = computed(
  () => 40 + (tokenAddresses.value.length - 2) * 10
);

function isOptionSelected(option: string): boolean {
  if (selectedOption.value === 'all' || option === 'all') {
    return selectedOption.value === option;
  }
  return isSameAddress(selectedOption.value, option);
}

/**
 * METHODS
 */
function handleSelected(newToken: string): void {
  if (newToken === 'all') {
    isProportional.value = true;
    selectedOption.value = 'all';
  } else {
    isProportional.value = false;
    selectedOption.value = newToken;
    tokenOut.value = newToken;
  }
}
</script>

<template>
  <BalDropdown :options="options" minWidth="44" @selected="handleSelected">
    <template #activator>
      <div class="group token-select-input selected selectable">
        <div>
          <BalAssetSet
            v-if="isProportional"
            :addresses="tokenAddresses"
            :width="50"
          />
          <BalAsset
            v-else
            :address="selectedToken.address"
            class="mr-2 shadow"
          />
        </div>
        <span class="text-base font-medium">
          <span v-if="isProportional">All tokens</span>
          <span v-else>{{ selectedToken.symbol }}</span>
        </span>
        <BalIcon
          name="chevron-down"
          size="sm"
          class="ml-2 text-blue-500 group-hover:text-pink-500 dark:text-blue-400 dark:group-hover:text-yellow-500 transition-colors"
        />
      </div>
    </template>
    <template #option="{ option }">
      <div v-if="option === 'all'" class="flex justify-between items-center">
        <div class="flex items-center">
          <BalAssetSet :addresses="tokenAddresses" :width="assetSetWidth" />
          {{ $t('allTokens') }}
        </div>
        <BalIcon
          v-if="isOptionSelected(option)"
          name="check"
          class="ml-2 text-blue-500 dark:text-blue-400"
        />
      </div>
      <div v-else class="flex justify-between items-center">
        <div class="flex items-center">
          <BalAsset :address="option" class="mr-2" />
          {{ getToken(option)?.symbol }}
        </div>
        <BalIcon
          v-if="isOptionSelected(option)"
          name="check"
          class="ml-2 text-blue-500 dark:text-blue-400"
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
