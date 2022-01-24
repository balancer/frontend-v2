<script lang="ts" setup>
import useTokens from '@/composables/useTokens';
import { computed } from 'vue';
import { sumBy } from 'lodash';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * COMPOSABLES
 */
const { tokens } = useTokens();
const {
  seedTokens,
  optimisedLiquidity,
  maxInitialLiquidity,
  tokenColors
} = usePoolCreation();
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
  'text-yellow-500': maxInitialLiquidity.value < 20000
}));
</script>

<template>
  <BalCard noPad shadow="none">
    <div
      class="p-2 px-3 border-b dark:border-gray-600"
      v-if="!upToLargeBreakpoint"
    >
      <h6 class="dark:text-gray-300">
        {{ $t('createAPool.maxInitialLiquidity') }}
      </h6>
    </div>
    <div class="p-2 px-4">
      <div class="grid grid-cols-12 w-full gap-y-1.5">
        <div class="col-span-6">
          <span
            class="text-sm font-semibold text-gray-700 dark:text-gray-500"
            >{{ $t('token') }}</span
          >
        </div>
        <div class="col-span-6 text-right">
          <span
            class="text-sm font-semibold text-gray-700 dark:text-gray-500"
            >{{ $t('usdValue') }}</span
          >
        </div>
        <template
          v-for="(token, i) in allocatedTokenWeights"
          :key="token.tokenAddress"
        >
          <div class="col-span-6 text-left  font-medium">
            <div class="flex flex-row items-center">
              <div
                class="rounded-full w-1.5 h-1.5 mr-2"
                :style="{ backgroundColor: tokenColors[i] }"
              ></div>
              <span class="text-sm">{{
                tokens[token.tokenAddress]?.symbol
              }}</span>
            </div>
            <div v-if="token.tokenAddress === 'unallocated'"></div>
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
          class="col-span-6 text-left font-medium text-sm"
          v-if="unallocatedTokenWeight > 0"
        >
          {{ $t('unallocated') }}
        </div>
        <div class="col-span-6 text-right" v-if="unallocatedTokenWeight > 0">
          -
        </div>
        <div class="col-span-6">
          <span class="text-sm font-semibold">{{ $t('total') }}</span>
        </div>
        <div
          :class="[
            'col-span-6 text-sm font-semibold flex items-center justify-end',
            totalsClass
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
