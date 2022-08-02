<script lang="ts" setup>
import { sumBy } from 'lodash';
import { computed } from 'vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

/**
 * COMPOSABLES
 */
const { tokens } = useTokens();
const { seedTokens, maxInitialLiquidity, tokenColors, getOptimisedLiquidity } =
  usePoolCreation();
const { fNum2 } = useNumbers();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const allocatedTokenWeights = computed(() =>
  seedTokens.value.filter(t => t.tokenAddress !== '')
);
const unallocatedTokenWeight = computed(() =>
  sumBy(
    seedTokens.value.filter(t => t.tokenAddress === ''),
    'weight'
  )
);

const totalsClass = computed(() => ({
  'text-gray-700 ': maxInitialLiquidity.value >= 20000,
  'text-orange-500': maxInitialLiquidity.value < 20000,
}));

const optimisedLiquidity = computed(() => getOptimisedLiquidity());
</script>

<template>
  <BalCard noPad shadow="none">
    <div
      v-if="!upToLargeBreakpoint"
      class="p-2 px-3 border-b dark:border-gray-600"
    >
      <h6 class="dark:text-gray-300">
        {{ $t('createAPool.maxInitialLiquidity') }}
      </h6>
    </div>
    <div class="p-2 px-4">
      <div class="grid grid-cols-12 gap-y-1.5 w-full">
        <div class="col-span-6">
          <span class="text-sm font-semibold text-gray-700 text-secondary">{{
            $t('token')
          }}</span>
        </div>
        <div class="col-span-6 text-right">
          <span class="text-sm font-semibold text-gray-700 text-secondary">{{
            $t('usdValue')
          }}</span>
        </div>
        <template
          v-for="(token, i) in allocatedTokenWeights"
          :key="token.tokenAddress"
        >
          <div class="col-span-6 font-medium text-left">
            <div class="flex flex-row items-center">
              <div
                class="mr-2 w-1.5 h-1.5 rounded-full"
                :style="{ backgroundColor: tokenColors[i] }"
              />
              <span class="text-sm">{{
                tokens[token.tokenAddress]?.symbol
              }}</span>
            </div>
            <div v-if="token.tokenAddress === 'unallocated'" />
          </div>
          <div class="col-span-6 text-sm text-right">
            {{
              fNum2(
                optimisedLiquidity[token.tokenAddress].liquidityRequired,
                FNumFormats.fiat
              )
            }}
          </div>
        </template>
        <div
          v-if="unallocatedTokenWeight > 0"
          class="col-span-6 text-sm font-medium text-left"
        >
          {{ $t('unallocated') }}
        </div>
        <div v-if="unallocatedTokenWeight > 0" class="col-span-6 text-right">
          -
        </div>
        <div class="col-span-6">
          <span class="text-sm font-semibold">{{ $t('total') }}</span>
        </div>
        <div
          :class="[
            'col-span-6 text-sm font-semibold flex items-center justify-end',
            totalsClass,
          ]"
        >
          {{ fNum2(maxInitialLiquidity, FNumFormats.fiat) }}
        </div>
      </div>
    </div>
    <!-- <BalAlert type="error" title="">
      <BalStack vertical spacing='xs'>

      <span class="font-medium text-gray-700">
        Add estimated token price for the unknown tokens to see potential pool
        liquidity percentages
      </span>
      <button class="font-semibold text-red-500">Add token prices -></button>
      </BalStack>
    </BalAlert> -->
  </BalCard>
</template>
