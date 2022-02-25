<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

import { bnum } from '@/lib/utils';

import { FullPool } from '@/services/balancer/subgraph/types';

import { TokenInfo } from '@/types/TokenList';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import useVeBal from '@/composables/useVeBAL';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo?: VeBalLockInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { balanceFor } = useTokens();
const { fNum2 } = useNumbers();
const { veBalBalance } = useVeBal();

/**
 * COMPUTED
 */
const poolShares = computed(() =>
  bnum(props.lockablePool.totalLiquidity).div(props.lockablePool.totalShares)
);

const bptBalance = computed(() => balanceFor(props.lockablePool.address));

const fiatTotal = computed(() => poolShares.value.times(bptBalance.value));

const lockedFiatTotal = computed(() =>
  props.veBalLockInfo?.hasExistingLock
    ? poolShares.value.times(props.veBalLockInfo.lockedAmount)
    : '0'
);

const lockedUntil = computed(() => {
  if (props.veBalLockInfo?.hasExistingLock && !props.veBalLockInfo?.isExpired) {
    return format(props.veBalLockInfo.lockedEndDate, PRETTY_DATE_FORMAT);
  }

  return '—';
});
</script>

<template>
  <BalCard>
    <div class="title">
      {{ $t('veBAL.myVeBAL.cards.myLpToken', [lockablePoolTokenInfo.symbol]) }}
    </div>
    <div class="value">
      {{
        props.veBalLockInfo?.hasExistingLock
          ? fNum2(fiatTotal, FNumFormats.fiat)
          : '—'
      }}
    </div>
  </BalCard>

  <BalCard>
    <div class="title">
      {{
        $t('veBAL.myVeBAL.cards.myLockedLpToken', [
          lockablePoolTokenInfo.symbol
        ])
      }}
    </div>
    <div class="value">
      {{
        props.veBalLockInfo?.hasExistingLock
          ? fNum2(lockedFiatTotal, FNumFormats.fiat)
          : '—'
      }}
    </div>
  </BalCard>

  <BalCard>
    <div class="title">
      {{ $t('veBAL.myVeBAL.cards.lockedEndDate') }}
    </div>
    <div class="value">
      {{ lockedUntil }}
    </div>
  </BalCard>

  <BalCard>
    <div class="title">
      {{ $t('veBAL.myVeBAL.cards.myVeBAL') }}
    </div>
    <div class="value">
      {{
        props.veBalLockInfo?.hasExistingLock
          ? fNum2(veBalBalance, FNumFormats.token)
          : '—'
      }}
    </div>
  </BalCard>
</template>

<style scoped>
.label {
  @apply text-sm text-gray-500 font-medium mb-2;
}
.value {
  @apply text-xl font-medium truncate flex items-center;
}
</style>
