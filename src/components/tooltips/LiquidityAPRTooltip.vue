<script setup lang="ts">
import { computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';

/**
 * TYPES
 */
type Props = {
  pool: DecoratedPool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();

const hasThirdPartyAPR = computed(() =>
  bnum(props.pool.apr.thirdPartyApr).gt(0)
);
</script>

<template v-slot:aprCell="pool">
  <BalTooltip width="auto" noPad>
    <template v-slot:activator>
      <div class="ml-1">
        <StarsIcon
          v-if="pool.apr.hasRewardApr || hasThirdPartyAPR"
          class="h-5 text-yellow-300"
          v-bind="$attrs"
        />
        <BalIcon
          v-else
          name="info"
          size="sm"
          class="text-gray-400 dark:text-gray-500"
          v-bind="$attrs"
        />
      </div>
    </template>
    <div class="text-sm divide-y dark:divide-gray-900">
      <div class="px-3 pt-3 pb-1 bg-gray-50 dark:bg-gray-800 rounded-t">
        <div class="text-gray-500">{{ $t('totalAPR') }}</div>
        <div class="text-lg">
          {{ fNum(pool.apr.total, 'percent') }}
        </div>
      </div>
      <div class="p-3">
        <div v-for="(item, idx) in pool.apr.items" :key="idx">
          <BalBreakdown
            :items="item.subItems"
            v-if="item.subItems && item.subItems.length > 0"
            :hideItems="false"
          >
            <div class="flex items-center">
              {{ fNum(item.apr, 'percent') }}
              <span class="ml-1 text-gray-500 text-xs flex items-center">
                {{ item.title }}
              </span>
            </div>
            <template v-if="true" #item="{ item }">
              {{ fNum(item.apr, 'percent') }}
              <span class="text-gray-500 text-xs ml-1">
                {{ item.title }}
              </span>
            </template>
          </BalBreakdown>
          <div v-else class="whitespace-nowrap flex items-center mb-1">
            {{ fNum(item.apr, 'percent') }}
            <span class="ml-1 text-gray-500 text-xs">{{ item.title }}</span>
          </div>
        </div>

        <!--        <BalBreakdown
          :items="Object.entries(thirdPartyBreakdown)"
          v-if="hasThirdPartyAPR"
          :hideItems="!thirdPartyMultiRewardPool"
        >
          <div class="flex items-center">
            {{ fNum(pool.dynamic.apr.thirdParty, 'percent') }}
            <span class="ml-1 text-gray-500 text-xs">
              {{ thirdPartyAPRLabel }}
            </span>
          </div>
          <template v-if="thirdPartyMultiRewardPool" #item="{ item }">
            {{ fNum(item[1], 'percent') }}
            <span class="text-gray-500 text-xs ml-1">
              {{ thirdPartyTokens[item[0]].symbol }} {{ $t('apr') }}
            </span>
          </template>
        </BalBreakdown>
        <BalBreakdown
          v-if="pool.apr.hasRewardApr"
          :items="Object.entries(lmBreakdown)"
          :hideItems="!lmMultiRewardPool"
        >
          <div class="flex items-center">
            {{ fNum(pool.dynamic.apr.liquidityMining, 'percent') }}
            <span class="ml-1 text-gray-500 text-xs flex items-center">
              {{ $t('liquidityMiningAPR') }}
            </span>
          </div>
          <template v-if="lmMultiRewardPool" #item="{ item }">
            {{ fNum(item[1], 'percent') }}
            <span class="text-gray-500 text-xs ml-1">
              {{ lmTokens[item[0]].symbol }} {{ $t('apr') }}
            </span>
          </template>
        </BalBreakdown>-->
      </div>
    </div>
  </BalTooltip>
</template>
