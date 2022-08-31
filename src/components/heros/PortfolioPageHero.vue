<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import AppHero from '@/components/heros/AppHero.vue';
import usePools from '@/composables/pools/usePools';
import useStaking from '@/composables/staking/useStaking';
import { useLock } from '@/composables/useLock';
import { isL2 } from '@/composables/useNetwork';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';

import HeroConnectWalletButton from './HeroConnectWalletButton.vue';

/**
 * COMPOSABLES
 */
const router = useRouter();
const { fNum2 } = useNumbers();
const { isWalletReady, isWalletConnecting } = useWeb3();
const { totalInvestedAmount, isLoadingUserPools } = usePools();
const { lockFiatValue, isLoadingLock } = useLock();
const {
  userData: {
    totalStakedFiatValue,
    isLoadingUserStakingData,
    isLoadingStakedPools,
    isUserStakeDataIdle,
  },
} = useStaking();

/**
 * COMPUTED
 */
const classes = computed(() => ({
  ['h-48']: !isWalletReady.value && !isWalletConnecting.value,
  ['h-44']: isWalletReady.value || isWalletConnecting.value,
}));

const isStakingLoading = computed(() => {
  return (
    isLoadingStakedPools.value ||
    isLoadingUserStakingData.value ||
    isUserStakeDataIdle.value
  );
});

const totalInvestedLabel = computed((): string => {
  const value = bnum(totalInvestedAmount.value || '0')
    .plus(lockFiatValue.value)
    .plus(totalStakedFiatValue.value)
    .toString();
  return fNum2(value, FNumFormats.fiat);
});

const totalVeBalLabel = computed((): string =>
  fNum2(lockFiatValue.value, FNumFormats.fiat)
);

const isLoadingLockAndStaking = computed(
  (): boolean => (!isL2.value && isLoadingLock.value) || isStakingLoading.value
);

const isLoadingTotalValue = computed(
  (): boolean => isLoadingUserPools.value || isLoadingLockAndStaking.value
);
</script>

<template>
  <AppHero :class="classes">
    <h1
      class="mb-2 font-body text-base font-medium text-white opacity-90"
      v-text="$t('myBalancerInvestments')"
    />

    <template v-if="isWalletReady || isWalletConnecting">
      <BalLoadingBlock
        v-if="isLoadingTotalValue"
        class="mx-auto w-40 h-10"
        white
      />
      <div v-else class="mb-1 text-3xl font-semibold text-white">
        {{ totalInvestedLabel }}
      </div>
      <div v-if="!isL2" class="inline-block relative mt-2">
        <BalLoadingBlock
          v-if="isLoadingTotalValue"
          class="mx-auto w-40 h-8"
          white
        />
        <div
          v-else
          class="group flex items-center px-3 h-8 text-sm font-medium text-yellow-500 hover:text-white focus:text-white rounded-tr rounded-bl border border-yellow-500 transition-colors cursor-pointer vebal-banner"
          @click="router.push({ name: 'vebal' })"
        >
          <span v-if="lockFiatValue === '0'"
            >{{ lockFiatValue }} {{ $t('veBAL.hero.tokens.veBAL') }}</span
          >
          <span v-else>{{ $t('inclXInVeBal', [totalVeBalLabel]) }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="text-3xl font-semibold text-white">
        {{ fNum2('0', FNumFormats.fiat) }}
      </div>
      <HeroConnectWalletButton class="mt-4" />
    </template>
  </AppHero>
</template>

<style>
.vebal-banner::before {
  @apply border border-yellow-500;

  content: '';
  width: 16px;
  height: 6px;
  left: 0;
  top: -5px;
  position: absolute;
  border-top-left-radius: 8px;
}

.vebal-banner::after {
  @apply border border-yellow-500;

  content: '';
  width: 16px;
  height: 6px;
  bottom: -5px;
  right: 0;
  position: absolute;
  border-bottom-right-radius: 8px;
}
</style>
