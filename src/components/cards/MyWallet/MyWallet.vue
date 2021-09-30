<script setup lang="ts">
import { useTradeState } from '@/composables/trade/useTradeState';
import useBreakpoints from '@/composables/useBreakpoints';
import useTokens from '@/composables/useTokens';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { appNetworkConfig, isWalletReady, toggleWalletSelectModal } = useWeb3();
const { upToLargeBreakpoint } = useBreakpoints();
const { t } = useI18n();
const { setTokenInAddress } = useTradeState();
const {
  balanceFor,
  balances,
  dynamicDataLoading: isLoadingBalances
} = useTokens();
const nativeCurrency = configService.network.nativeAsset.symbol;

const etherBalance = computed(() => {
  if (!isWalletReady.value) return '-';
  return Number(balanceFor(appNetworkConfig.nativeAsset.address)).toFixed(4);
});

const tokensWithBalance = computed(() => {
  return Object.keys(balances.value).filter(
    tokenAddress =>
      Number(balances.value[tokenAddress]) > 0 &&
      tokenAddress !== appNetworkConfig.nativeAsset.address
  );
});
</script>

<template>
  <BalCard noPad growContent :hFull="upToLargeBreakpoint" :shadow="false">
    <div class="flex flex-col bg-white w-full h-full bg-gray-50 lg:bg-white ">
      <div class="flex lg:justify-between p-3 lg:shadow-lg">
        <h6>{{ $t('myWallet') }}<span v-if="upToLargeBreakpoint">:</span></h6>
        <div
          class="font-semibold lg:font-normal ml-1 lg:ml-0"
          v-if="!isLoadingBalances"
        >
          {{ etherBalance }} {{ nativeCurrency }}
        </div>
        <BalLoadingBlock v-else class="h-8 w-12" />
      </div>
      <div class="h-full p-3">
        <BalLoadingBlock v-if="isLoadingBalances" class="h-8" />
        <BalAssetSet
          v-else-if="isWalletReady"
          @click="setTokenInAddress"
          :width="230"
          wrap
          :size="32"
          :addresses="tokensWithBalance"
        ></BalAssetSet>
        <div v-else class="w-full mt-4 lg:mt-0 flex justify-center">
          <BalBtn size="xs" @click="toggleWalletSelectModal"
            >Connect your wallet</BalBtn
          >
        </div>
      </div>
    </div>
  </BalCard>
</template>
