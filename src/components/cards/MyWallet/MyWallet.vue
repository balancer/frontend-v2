<script setup lang="ts">
import { take } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useTradeState } from '@/composables/trade/useTradeState';
import useBreakpoints from '@/composables/useBreakpoints';
import { isMainnet } from '@/composables/useNetwork';
import useTokens from '@/composables/useTokens';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';

const { appNetworkConfig, isWalletReady, toggleWalletSelectModal } = useWeb3();
const { upToLargeBreakpoint } = useBreakpoints();
const { setTokenInAddress } = useTradeState();
const {
  hasBalance,
  nativeAsset,
  balanceFor,
  balances,
  dynamicDataLoading: isLoadingBalances
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

const tokensWithBalance = computed(() => {
  return take(
    Object.keys(balances.value).filter(
      tokenAddress =>
        Number(balances.value[tokenAddress]) > 0 &&
        tokenAddress !== appNetworkConfig.nativeAsset.address &&
        tokenAddress !== appNetworkConfig.addresses.veBAL
    ),
    21
  );
});
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
        <h6 v-if="!upToLargeBreakpoint">{{ $t('myWallet2') }}</h6>
        <div
          class="font-semibold lg:font-normal ml-1 lg:ml-0"
          v-if="!isLoadingBalances"
        >
          <div
            class="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors mr-0.5"
            v-if="!hasBalance(nativeAsset.address)"
          >
            {{ etherBalance }} {{ nativeCurrency }}
            <BalTooltip
              v-if="isWalletReady"
              :text="
                isMainnet
                  ? noNativeCurrencyMessageEthereum
                  : noNativeCurrencyMessage
              "
              icon-size="sm"
              :icon-name="'alert-triangle'"
              :icon-class="
                'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'
              "
              width="72"
              class="relative top-0.5"
            />
          </div>
          <div v-else>{{ etherBalance }} {{ nativeCurrency }}</div>
        </div>
        <BalLoadingBlock v-else class="h-8 w-12" />
      </div>
      <div class="my-wallet h-full p-3 z-0">
        <BalLoadingBlock v-if="isLoadingBalances" class="h-8" />
        <div v-else-if="isWalletReady">
          <BalAssetSet
            @click="setTokenInAddress"
            :balAssetProps="{ button: true }"
            :width="275"
            wrap
            :size="30"
            :addresses="tokensWithBalance"
            :maxAssetsPerLine="28"
          >
          </BalAssetSet>
          <p
            class="text-sm text-gray-500 dark:text-gray-400 opacity-0 fade-in"
            v-if="tokensWithBalance.length === 0"
          >
            {{ noTokensMessage }}.
          </p>
        </div>
        <div v-else class="w-full mt-4 lg:mt-0 flex font-medium">
          <BalLink @click="toggleWalletSelectModal"
            >Connect your wallet</BalLink
          >
        </div>
      </div>
    </div>
  </BalCard>
</template>
