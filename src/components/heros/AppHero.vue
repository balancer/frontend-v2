<script lang="ts" setup>
import { computed } from 'vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import usePools from '@/composables/pools/usePools';
import { EXTERNAL_LINKS } from '@/constants/links';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';
import useDarkMode from '@/composables/useDarkMode';
import { useLock } from '@/composables/useLock';
import { bnum } from '@/lib/utils';
import { useRouter } from 'vue-router';
import useStaking from '@/composables/staking/useStaking';

/**
 * COMPOSABLES
 */
const router = useRouter();
const { fNum2 } = useNumbers();
const {
  isWalletReady,
  toggleWalletSelectModal,
  isWalletConnecting
} = useWeb3();
const { trackGoal, Goals } = useFathom();
const { totalInvestedAmount, isLoadingUserPools } = usePools();
const { darkMode } = useDarkMode();
const { lockFiatValue, isLoadingLock } = useLock();
const {
  totalStakedFiatValue,
  isLoading: isStakingLoading,
  isStakingQueryEnabled
} = useStaking();

/**
 * COMPUTED
 */
const classes = computed(() => ({
  ['h-72']: !isWalletReady.value && !isWalletConnecting.value,
  ['h-40']: isWalletReady.value || isWalletConnecting.value
}));

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

const isLoadingTotalValue = computed(
  (): boolean =>
    isLoadingUserPools.value ||
    isLoadingLock.value ||
    (isStakingQueryEnabled.value && isStakingLoading.value)
);

/**
 * METHODS
 */
function onClickConnect() {
  toggleWalletSelectModal(true);
  trackGoal(Goals.ClickHeroConnectWallet);
}
</script>

<template>
  <div :class="['app-hero', classes]">
    <div class="w-full max-w-2xl mx-auto">
      <template v-if="isWalletReady || isWalletConnecting">
        <h1
          v-text="$t('myBalancerInvestments')"
          class="text-base font-medium text-white opacity-90 font-body mb-2"
        />
        <BalLoadingBlock
          v-if="isLoadingTotalValue"
          class="h-10 w-40 mx-auto"
          white
        />
        <div v-else class="text-3xl font-bold text-white">
          {{ totalInvestedLabel }}
        </div>
        <div class="mt-2 inline-block">
          <BalLoadingBlock
            v-if="isLoadingTotalValue"
            class="h-8 w-40 mx-auto"
            white
          />
          <div
            v-else
            class="h-8 flex items-center px-3 bg-yellow-500 text-gray-900 rounded-sm
          text-sm font-medium cursor-pointer"
            @click="router.push({ name: 'vebal' })"
          >
            {{ $t('inclXInVeBal', [totalVeBalLabel]) }}
          </div>
        </div>
      </template>
      <template v-else>
        <h1
          v-text="$t('ammPlatform')"
          class="text-white text-center text-4xl md:text-5xl pb-2 font-display font-black"
        />
        <div class="flex justify-center mt-4">
          <BalBtn
            :color="darkMode ? 'gray' : 'white'"
            class="mr-3"
            @click="onClickConnect"
          >
            {{ $t('connectWallet') }}
          </BalBtn>
          <BalBtn
            tag="a"
            :href="EXTERNAL_LINKS.Balancer.Home"
            target="_blank"
            rel="noreferrer"
            color="white"
            outline
            @click="trackGoal(Goals.ClickHeroLearnMore)"
          >
            {{ $t('learnMore') }}
            <BalIcon name="arrow-up-right" size="sm" class="ml-1" />
          </BalBtn>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
.app-hero {
  @apply bg-cover bg-center flex items-center justify-center text-center px-4;
  transition: all 0.3s ease-in-out;
  background-image: url('/images/backgrounds/bg-header.svg');
}
</style>
