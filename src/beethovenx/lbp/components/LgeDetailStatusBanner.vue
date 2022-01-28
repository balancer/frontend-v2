<script setup lang="ts">
import useLge from '@/beethovenx/lbp/composables/useLge';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { FullPool } from '@/services/balancer/subgraph/types';

type Props = {
  lge: GqlLge;
  pool: FullPool;
};

const props = defineProps<Props>();

const {
  isBeforeStart,
  isAfterEnd,
  startDateTimeFormatted,
  endDateTimeFormatted
} = useLge(props.lge, props.pool);
</script>

<template>
  <div
    v-if="isBeforeStart || isAfterEnd"
    :class="[
      'app-nav-alert text-white',
      isBeforeStart ? 'bg-green-500' : 'bg-red-500'
    ]"
  >
    <div class="w-8" />
    <div class="flex-1 text-center flex items-center justify-center">
      <span class="font-semibold text-black">
        {{ props.lge.name }} Liquidity Bootstrapping Pool
        {{ isBeforeStart ? ' starts' : ' ended' }}:
        {{ `${isBeforeStart ? startDateTimeFormatted : endDateTimeFormatted}` }}
      </span>
    </div>
  </div>
</template>
