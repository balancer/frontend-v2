<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import useBreakpoints from '@/composables/useBreakpoints';
import { isMainnet } from '@/composables/useNetwork';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { AnyPool } from '@/services/pool/types';
import MyWalletSubheader from './MyWalletSubheader.vue';
import useNativeBalance from '@/composables/useNativeBalance';
import { usePool } from '@/composables/usePool';
import useMyWalletTokens from '@/composables/useMyWalletTokens';
import { useSwapState } from '@/composables/swap/useSwapState';
import { includesAddress } from '@/lib/utils';

type Props = {
  excludedTokens?: string[];
  // If pool prop is provided, Tokens are grouped into:
  // 'Pool tokens in wallet' and 'Other tokens in wallet'
  pool?: AnyPool;
  includeNativeAsset?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  excludedTokens: () => [],
  pool: undefined,
  includeNativeAsset: false,
});

const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();
const { upToLargeBreakpoint } = useBreakpoints();
const { setTokenInAddress } = useSwapState();

const networkName = configService.network.name;
const { t } = useI18n();
const { isDeepPool, isPreMintedBptPool } = usePool(toRef(props, 'pool'));

const {
  tokensWithBalance,
  poolTokenAddresses,
  poolTokensWithBalance,
  poolTokensWithoutBalance,
  notPoolTokensWithBalance,
  isLoadingBalances,
} = useMyWalletTokens(props);

const noNativeCurrencyMessage = computed(() => {
  return t('noNativeCurrency', [nativeCurrency, networkName]);
});

const noNativeCurrencyMessageEthereum = computed(() => {
  return t('noNativeCurrencyEthereum', [nativeCurrency, networkName]);
});

const noTokensMessage = computed(() => {
  return t('noTokensInWallet', [networkName]);
});

const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance();

function handleAssetClick(tokenAddress) {
  setTokenInAddress(tokenAddress);
  const isPoolToken = includesAddress(poolTokenAddresses.value, tokenAddress);
  emit('click:asset', tokenAddress, isPoolToken);
}

const emit = defineEmits<{
  (e: 'click:asset', tokenAddress: string, isPoolToken: boolean): void;
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
        v-if="!upToLargeBreakpoint"
        class="flex lg:justify-between p-3 pb-0 lg:pb-3 lg:border-b dark:border-gray-900"
      >
        <h6>
          {{ $t('myWallet2') }}
        </h6>
        <div
          v-if="!isLoadingBalances"
          class="ml-1 lg:ml-0 font-semibold lg:font-normal"
        >
          <div
            v-if="!hasNativeBalance"
            class="mr-0.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            {{ nativeBalance }} {{ nativeCurrency }}
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
          <div v-else>{{ nativeBalance }} {{ nativeCurrency }}</div>
        </div>
        <BalLoadingBlock v-else class="w-12 h-8" />
      </div>
      <div class="z-0 px-3 pb-3 h-full my-wallet">
        <BalLoadingBlock v-if="isLoadingBalances" class="h-8" />
        <div v-else-if="isWalletReady">
          <template v-if="pool">
            <MyWalletSubheader
              v-if="isDeepPool"
              class="text-sm border-b text-secondary"
            >
              {{ t('myWalletCard.title.poolTokens') }}
            </MyWalletSubheader>
            <div class="mt-5">
              <BalAssetSet
                :balAssetProps="{ button: true }"
                :width="275"
                wrap
                :size="30"
                :addresses="[
                  ...poolTokensWithBalance,
                  ...poolTokensWithoutBalance,
                ]"
                :disabledAddresses="poolTokensWithoutBalance"
                :maxAssetsPerLine="7"
                @click="handleAssetClick"
              />
            </div>
            <template
              v-if="
                isDeepPool &&
                isPreMintedBptPool &&
                notPoolTokensWithBalance.length
              "
            >
              <MyWalletSubheader
                class="my-5 text-sm border-t border-b text-secondary"
              >
                {{ t('myWalletCard.title.otherTokens') }}
              </MyWalletSubheader>
              <BalAssetSet
                :balAssetProps="{ button: true }"
                :width="275"
                wrap
                :size="30"
                :addresses="notPoolTokensWithBalance"
                :maxAssetsPerLine="7"
                @click="handleAssetClick"
              />
            </template>
          </template>
          <div v-else class="mt-3">
            <BalAssetSet
              :balAssetProps="{ button: true }"
              :width="275"
              wrap
              :size="30"
              :addresses="tokensWithBalance"
              :maxAssetsPerLine="7"
              @click="handleAssetClick"
            />
          </div>

          <p
            v-if="tokensWithBalance.length === 0"
            class="text-sm opacity-0 text-secondary fade-in"
          >
            {{ noTokensMessage }}.
          </p>
        </div>
        <div v-else class="flex mt-4 w-full font-medium">
          <BalLink @click="startConnectWithInjectedProvider">
            {{ t('connectYourWallet') }}
          </BalLink>
        </div>
      </div>
    </div>
  </BalCard>
</template>
