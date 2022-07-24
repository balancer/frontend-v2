<script setup lang="ts">
import { take } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useBreakpoints from '@/composables/useBreakpoints';
import { isMainnet } from '@/composables/useNetwork';
import useTokens from '@/composables/useTokens';
import { isSameAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { Address } from '@/types';

type Props = {
  excludedTokens?: string[];
};

const props = withDefaults(defineProps<Props>(), {
  excludedTokens: () => []
});

const {
  appNetworkConfig,
  isWalletReady,
  startConnectWithInjectedProvider
} = useWeb3();
const { upToLargeBreakpoint } = useBreakpoints();
const {
  hasBalance,
  nativeAsset,
  balanceFor,
  balances,
  dynamicDataLoading: isLoadingBalances,
} = useTokens();
const nativeCurrency = configService.network.nativeAsset.symbol;
const networkName = configService.network.name;
const { t } = useI18n();

const etherBalance = computed(() => {
  if (!isWalletReady.value) return '-';
  return Number(balanceFor(appNetworkConfig.nativeAsset.address)).toFixed(4);
});

const noNativeCurrencyMessage = computed(() => {
  return t('noNativeCurrency', [nativeCurrency, networkName]);
});

const noNativeCurrencyMessageEthereum = computed(() => {
  return t('noNativeCurrencyEthereum', [nativeCurrency, networkName]);
});

const noTokensMessage = computed(() => {
  return t('noTokensInWallet', [networkName]);
});

function isExcludedToken(tokenAddress: Address) {
  return props.excludedTokens.some(excludedAddress =>
    isSameAddress(excludedAddress, tokenAddress)
  );
}

const tokensWithBalance = computed(() => {
  return take(
    Object.keys(balances.value).filter(tokenAddress => {
      return (
        Number(balances.value[tokenAddress]) > 0 &&
        !isExcludedToken(tokenAddress) &&
        !isSameAddress(tokenAddress, appNetworkConfig.nativeAsset.address) &&
        !isSameAddress(tokenAddress, appNetworkConfig.addresses.veBAL)
      );
    }),
    21
  );
});

const emit = defineEmits<{
  (e: 'click:asset', tokenAddress: Address): void;
}>();
</script>

<template>
  <BalCard
    :square="upToLargeBreakpoint"
    noPad
    :noBorder="upToLargeBreakpoint"
    growContent
    :hFull="upToLargeBreakpoint"
    shadow="none"
  >
    <div class="flex flex-col w-full h-full bg-transparent">
      <div
        class="flex lg:justify-between p-3 pb-0 lg:pb-3 lg:border-b dark:border-gray-700"
      >
        <h6 v-if="!upToLargeBreakpoint">
          {{ $t('myWallet2') }}
        </h6>
        <div
          v-if="!isLoadingBalances"
          class="ml-1 lg:ml-0 font-semibold lg:font-normal"
        >
          <div
            v-if="!hasBalance(nativeAsset.address)"
            class="mr-0.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            {{ etherBalance }} {{ nativeCurrency }}
            <BalTooltip
              v-if="isWalletReady"
              :text="
                isMainnet
                  ? noNativeCurrencyMessageEthereum
                  : noNativeCurrencyMessage
              "
              iconSize="sm"
              :iconName="'alert-triangle'"
              :iconClass="'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'"
              width="72"
              class="relative top-0.5"
            />
          </div>
          <div v-else>{{ etherBalance }} {{ nativeCurrency }}</div>
        </div>
        <BalLoadingBlock v-else class="w-12 h-8" />
      </div>
      <div class="z-0 p-3 h-full my-wallet">
        <BalLoadingBlock v-if="isLoadingBalances" class="h-8" />
        <div v-else-if="isWalletReady">
          <BalAssetSet
            @click="tokenAddress => emit('click:asset', tokenAddress)"
            :balAssetProps="{ button: true }"
            :width="275"
            wrap
            :size="30"
            :addresses="tokensWithBalance"
            :maxAssetsPerLine="28"
          />
          <p
            v-if="tokensWithBalance.length === 0"
            class="text-sm opacity-0 text-secondary fade-in"
          >
            {{ noTokensMessage }}.
          </p>
        </div>
        <div v-else class="flex mt-4 lg:mt-0 w-full font-medium">
          <BalLink @click="startConnectWithInjectedProvider">
            Connect your wallet
          </BalLink>
        </div>
      </div>
    </div>
  </BalCard>
</template>
