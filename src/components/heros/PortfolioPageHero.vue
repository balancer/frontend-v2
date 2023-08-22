<script lang="ts" setup>
import { computed } from 'vue';

import AppHero from '@/components/heros/AppHero.vue';
import { useLock } from '@/composables/useLock';
import useNetwork from '@/composables/useNetwork';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';

import HeroConnectWalletButton from './HeroConnectWalletButton.vue';
import { useUserPools } from '@/providers/local/user-pools.provider';
import { isVeBalSupported } from '@/composables/useVeBAL';
import ProceedToSyncModal from '../contextual/pages/vebal/cross-chain-boost/ProceedToSyncModal.vue';
import configs from '@/lib/config';
import { Network } from '@/lib/config/types';
import {
  useCrossChainSync,
  veBalSyncSupportedNetworks,
} from '@/providers/cross-chain-sync.provider';
import { NetworkSyncState } from '@/providers/cross-chain-sync.provider';

/**
 * COMPOSABLES
 */
const showProceedModal = ref(false);
const { fNum } = useNumbers();
const { isWalletReady, isWalletConnecting } = useWeb3();
const { totalFiatValue, isLoading: isLoadingPools } = useUserPools();
const { totalLockedValue } = useLock();
const { networkId } = useNetwork();
const {
  l2VeBalBalances,
  isLoading: isLoadingSyncState,
  networksSyncState,
} = useCrossChainSync();
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

const showVeBalBalanceTooltip = computed(() => {
  if (!veBalSyncSupportedNetworks.includes(networkId.value)) {
    return false;
  }

  if (networksSyncState.value[networkId.value] === NetworkSyncState.Synced) {
    return false;
  }

  return true;
});

const veBalBalanceTooltip = computed(() => {
  return `Sync your veBAL balance from Ethereum Mainnet (L1) to ${
    configs[networkId.value].chainName
  } to get your max staking boost. Sync via the veBAL page on L1. Note: If you have just synced on L1, it may take up to an hour to display here.`;
});
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
          v-if="isLoadingTotalValue || isLoadingSyncState"
          class="mx-auto w-40 h-8"
          white
        />
        <div
          v-else
          class="group flex items-center px-3 h-8 text-sm font-medium text-yellow-500 hover:text-white focus:text-white rounded-tr rounded-bl border border-yellow-500 transition-colors cursor-pointer vebal-banner"
          @click="showProceedModal = true"
        >
          <span
            v-if="
              networkId !== Network.MAINNET &&
              Number(l2VeBalBalances?.[networkId]) > 0
            "
          >
            {{ l2VeBalBalances?.[networkId] }}
            {{ $t('veBAL.hero.tokens.veBAL') }}
          </span>
          <span v-else-if="totalLockedValue === '0'"
            >{{ totalLockedValue }} {{ $t('veBAL.hero.tokens.veBAL') }}</span
          >
          <span v-else>{{ $t('inclXInVeBal', [totalVeBalLabel]) }}</span>

          <BalTooltip
            v-if="showVeBalBalanceTooltip"
            :text="veBalBalanceTooltip"
          >
            <template #activator>
              <img
                src="/src/assets/images/icons/frame-loading.svg"
                alt=""
                class="rounded-full"
              />
            </template>
          </BalTooltip>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="text-3xl font-semibold text-white">
        {{ fNum('0', FNumFormats.fiat) }}
      </div>
      <HeroConnectWalletButton class="mt-4" />
    </template>

    <ProceedToSyncModal
      :isVisible="showProceedModal"
      @close="showProceedModal = false"
    />
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
