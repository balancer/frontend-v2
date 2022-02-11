<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { isStablePhantom, isWstETH } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/poolAPR';

import { DecoratedPoolWithGaugeShares } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';

/**
 * TYPES
 */
type Props = {
  pool: DecoratedPoolWithGaugeShares;
};

/**
 * PROPS
 */
const props = defineProps<Props>();
</script>

<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        color="white"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        class="mr-2 p-1 relative"
        :circle="upToLargeBreakpoint"
      >
        <ActivityIcon />
      </BalBtn>
    </template>
    <BalCard class="w-72" noPad noBorder>
      <template v-slot:header>
        <div
          class="p-3 w-full flex items-center justify-between border-b dark:border-gray-900"
        >
          <h5>{{ $t('recentActivityTitle') }}</h5>
        </div>
      </template>
      <div :class="['p-3']">
        <template>{{ $t('noRecentActivity') }}</template>
      </div>
    </BalCard>
  </BalPopover>
</template>
