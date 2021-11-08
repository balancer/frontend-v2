<script setup lang="ts">
import { toRef, computed } from 'vue';
import { usePool } from '@/composables/usePool';
import { FullPool } from '@/services/balancer/subgraph/types';
import useConfig from '@/composables/useConfig';
import useTokens from '@/composables/useTokens';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
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
          assetOut: wstETH.address
        }
      }"
      class="text-xs text-gray-500 underline"
    >
      {{ $t('wrapInstruction', [stETH.symbol, wstETH.symbol]) }}
    </router-link>
    <BalTooltip>
      <template v-slot:activator>
        <BalIcon name="info" size="xs" class="text-gray-400 ml-2" />
      </template>
      <div v-html="$t('wrapStEthTooltip')" />
    </BalTooltip>
  </div>
</template>
