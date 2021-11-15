<script lang="ts" setup>
import useTokens from '@/composables/useTokens';
import { TokenWeight } from './ChooseWeights.vue';
import { computed } from 'vue';
import { sumBy } from 'lodash';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import { useI18n } from 'vue-i18n';
import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';

type Props = {
  colors: string[];
};

const props = withDefaults(defineProps<Props>(), {
  colors: [] as any
});

/**
 * COMPOSABLES
 */
const { tokens } = useTokens();
const {
  tokenWeights,
  optimisedLiquidity,
  maxInitialLiquidity
} = usePoolCreation();
const { t } = useI18n();
const { fNum } = useNumbers();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const allocatedTokenWeights = computed(() =>
  tokenWeights.value.filter(t => t.tokenAddress !== '')
);
const unallocatedTokenWeight = computed(() =>
  sumBy(
    tokenWeights.value.filter(t => t.tokenAddress === ''),
    'weight'
  )
);
</script>

<template>
  <BalCard noPad shadow="false">
    <div class="p-2 px-3 border-b" v-if="!upToLargeBreakpoint">
      <h6>{{ $t('createAPool.maxInitialLiquidity') }}</h6>
    </div>
    <div class="p-2">
      <div class="grid grid-cols-12 w-full">
        <div class="col-span-5">
          <span class="text-sm font-semibold">{{ $t('token') }}</span>
        </div>
        <div class="col-span-4 text-right">
          <span class="text-sm font-semibold">{{ $t('usdValue') }}</span>
        </div>
        <div class="col-span-3 text-right">
          <span class="text-sm font-semibold">{{ $t('poolPercent') }}</span>
        </div>
        <template
          v-for="(token, i) in allocatedTokenWeights"
          :key="token.tokenAddress"
        >
          <div class="col-span-5 text-left  font-medium">
            <div class="flex flex-row items-center">
              <div
                class="rounded-full w-1.5 h-1.5 mr-2"
                :style="{ backgroundColor: colors[i] }"
              ></div>
              <span>{{ tokens[token.tokenAddress]?.symbol }}</span>
            </div>
            <div v-if="token.tokenAddress === 'unallocated'"></div>
          </div>
          <div class="col-span-4 text-right">
            {{
              fNum(
                optimisedLiquidity[token.tokenAddress].liquidityRequired,
                'usd'
              )
            }}
          </div>
          <div class="col-span-3 text-right  font-medium">
            {{ token.weight }}%
          </div>
        </template>
        <div
          class="col-span-5 text-left font-medium"
          v-if="unallocatedTokenWeight > 0"
        >
          {{ $t('unallocated') }}
        </div>
        <div class="col-span-4 text-right" v-if="unallocatedTokenWeight > 0">
          -
        </div>
        <div
          class="col-span-3 text-right font-medium"
          v-if="unallocatedTokenWeight > 0"
        >
          {{ unallocatedTokenWeight }}%
        </div>
        <div class="col-span-5">
          <span class="text-sm font-semibold">{{ $t('total') }}</span>
        </div>
        <div class="col-span-4 text-right">
          {{ fNum(maxInitialLiquidity, 'usd') }}
        </div>
        <div class="col-span-3 text-right">
          <span class="text-sm font-semibold"
            >{{ 100 - unallocatedTokenWeight }}%</span
          >
        </div>
      </div>
    </div>
  </BalCard>
</template>
