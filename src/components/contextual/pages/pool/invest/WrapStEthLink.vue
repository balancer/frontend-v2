<script setup lang="ts">
import { computed, toRef } from 'vue';

import useConfig from '@/composables/useConfig';
import { usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { Pool } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { isWstETHPool } = usePool(toRef(props, 'pool'));
const { networkConfig } = useConfig();
const { getToken } = useTokens();

/**
 * COMPUTED
 */
const stETH = computed(() => getToken(networkConfig.addresses.stETH));
const wstETH = computed(() => getToken(networkConfig.addresses.wstETH));
</script>

<template>
  <div v-if="isWstETHPool" class="flex items-center mb-4">
    <router-link
      :to="{
        name: 'trade',
        params: {
          assetIn: stETH.address,
          assetOut: wstETH.address,
        },
      }"
      class="text-xs underline text-secondary"
    >
      {{ $t('wrapInstruction', [stETH.symbol, wstETH.symbol]) }}
    </router-link>
    <BalTooltip>
      <template #activator>
        <BalIcon
          name="info"
          size="xs"
          class="ml-2 text-gray-400 dark:text-gray-500"
        />
      </template>
      <div v-html="$t('wrapStEthTooltip')" />
    </BalTooltip>
  </div>
</template>
