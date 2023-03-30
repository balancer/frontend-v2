<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import AppHero from '@/components/heros/AppHero.vue';
import { useLock } from '@/composables/useLock';
import useNetwork from '@/composables/useNetwork';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';

import HeroConnectWalletButton from './HeroConnectWalletButton.vue';
import { useUserPools } from '@/providers/local/user-pools.provider';
import { isVeBalSupported } from '@/composables/useVeBAL';

/**
 * COMPOSABLES
 */
const router = useRouter();
const { fNum } = useNumbers();
const { isWalletReady, isWalletConnecting } = useWeb3();
const { totalFiatValue, isLoading: isLoadingPools } = useUserPools();
const { totalLockedValue } = useLock();
const { networkSlug } = useNetwork();

/**
 * COMPUTED
 */
const classes = computed(() => ({
  ['h-48']: !isWalletReady.value && !isWalletConnecting.value,
  ['h-44']: isWalletReady.value || isWalletConnecting.value,
}));

const totalInvestedLabel = computed((): string =>
  fNum(totalFiatValue.value, FNumFormats.fiat)
);

const totalVeBalLabel = computed((): string =>
  fNum(totalLockedValue.value, FNumFormats.fiat)
);

const isLoadingTotalValue = computed((): boolean => isLoadingPools.value);
</script>

<template>
  <AppHero :class="classes">
    <h1
      class="mb-2 font-body text-base font-medium text-white opacity-90"
      v-text="$t('myBalancerBalance')"
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
      <div v-if="!isVeBalSupported" class="inline-block relative mt-2">
        <BalLoadingBlock
          v-if="isLoadingTotalValue"
          class="mx-auto w-40 h-8"
          white
        />
        <div
          v-else
          class="group flex items-center px-3 h-8 text-sm font-medium text-yellow-500 hover:text-white focus:text-white rounded-tr rounded-bl border border-yellow-500 transition-colors cursor-pointer vebal-banner"
          @click="router.push({ name: 'vebal', params: { networkSlug } })"
        >
          <span v-if="totalLockedValue === '0'"
            >{{ totalLockedValue }} {{ $t('veBAL.hero.tokens.veBAL') }}</span
          >
          <span v-else>{{ $t('inclXInVeBal', [totalVeBalLabel]) }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="text-3xl font-semibold text-white">
        {{ fNum('0', FNumFormats.fiat) }}
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
