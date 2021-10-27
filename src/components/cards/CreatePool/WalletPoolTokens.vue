<script lang="ts" setup>
import useTokens from '@/composables/useTokens';
import { TokenWeight } from './ChooseWeights.vue';
import { computed } from 'vue';
import { sumBy } from 'lodash';

type Props = {
  tokenWeights: TokenWeight[];
  colors: string[];
};

const props = withDefaults(defineProps<Props>(), {
  tokenWeights: [] as any,
  colors: [] as any
});

const { tokens } = useTokens();

const allocatedTokenWeights = computed(() =>
  props.tokenWeights.filter(t => t.tokenAddress !== '')
);
const unallocatedTokenWeight = computed(() =>
  sumBy(
    props.tokenWeights.filter(t => t.tokenAddress === ''),
    'weight'
  )
);
</script>

<template>
  <BalCard noPad shadow="false">
    <div class="p-2 px-3 border-b">
      <h6>Max initial liquidity in wallet</h6>
    </div>
    <div class="p-2">
      <div class="grid grid-cols-12 w-full">
        <div class="col-span-5">
          <span class="text-sm font-semibold">Token</span>
        </div>
        <div class="col-span-4 text-right">
          <span class="text-sm font-semibold">USD Value</span>
        </div>
        <div class="col-span-3 text-right">
          <span class="text-sm font-semibold">Pool %</span>
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
            0
          </div>
          <div class="col-span-3 text-right  font-medium">
            {{ token.weight }}%
          </div>
        </template>
        <div
          class="col-span-5 text-left font-medium"
          v-if="unallocatedTokenWeight > 0"
        >
          Unallocated
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
          <span class="text-sm font-semibold">Total</span>
        </div>
        <div class="col-span-4 text-right"></div>
        <div class="col-span-3 text-right">
          <span class="text-sm font-semibold"
            >{{ 100 - unallocatedTokenWeight }}%</span
          >
        </div>
      </div>
    </div>
  </BalCard>
</template>
