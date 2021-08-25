<template>
  <div>
    <div class="p-4 border-b dark:border-gray-900">
      <div class="flex justify-between items-center mb-4">
        <h5 v-text="$t('account')" class="leading-none" />
        <div v-if="!hideDisconnect">
          <BalBtn outline color="gray" size="xs" @click="disconnectWallet">
            Disconnect
          </BalBtn>
        </div>
      </div>
      <div class="flex mt-1">
        <div class="flex">
          <div class="relative">
            <Avatar :address="account" size="44" />
            <div class="connector-icon-wrapper">
              <img
                :src="connectorLogo"
                class="p-0.5 w-5 h-5 absolute bottom-0 right-0 flex items-center justify-center bg-white rounded-full"
              />
            </div>
          </div>
          <div class="ml-2">
            <div class="address flex items-baseline">
              <div v-text="_shorten(account)" />
              <div class="ml-3 flex">
                <BalTooltip>
                  <template v-slot:activator>
                    <BalBtn
                      circle
                      color="gray"
                      size="xs"
                      flat
                      @click="copyAddress"
                      class="mr-2"
                    >
                      <BalIcon v-if="copiedAddress" name="check" size="xs" />
                      <BalIcon v-else name="clipboard" size="xs" />
                    </BalBtn>
                  </template>
                  <div
                    v-text="copiedAddress ? $t('copied') : $t('copyAddress')"
                    class="w-20 text-center"
                  />
                </BalTooltip>
                <BalBtn
                  circle
                  flat
                  color="gray"
                  size="xs"
                  tag="a"
                  :href="explorer.addressLink(account)"
                  target="_blank"
                  rel="noreferrer"
                >
                  <BalIcon name="arrow-up-right" size="xs" />
                </BalBtn>
              </div>
            </div>
            <div class="text-sm">{{ connectorName }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="hidden px-4">
      <span v-text="$t('language')" class="font-medium mb-2" />
      <div class="flex mt-1">
        <div
          v-for="(locale, localeKey) in locales"
          :key="localeKey"
          class="option w-16 mr-2 py-1 text-center border rounded-xl cursor-pointer"
          :class="{ active: appLocale === localeKey }"
          @click="setLocale(localeKey)"
        >
          {{ locale }}
        </div>
      </div>
    </div>
    <div class="hidden px-4 mt-4">
      <span v-text="$t('theme')" class="font-medium mb-2" />
      <div class="flex mt-1">
        <div
          class="option w-16 mr-2 py-1.5 flex items-center justify-center border rounded-xl cursor-pointer"
          :class="{ active: !appDarkMode }"
          @click="setDarkMode(false)"
        >
          <BalIcon name="sun" size="sm" />
        </div>
        <div
          class="option w-16 mr-2 py-1.5 flex items-center justify-center border rounded-xl cursor-pointer"
          :class="{ active: appDarkMode }"
          @click="setDarkMode(true)"
        >
          <BalIcon name="moon" size="sm" />
        </div>
      </div>
    </div>
    <div class="px-4 mt-4">
      <div class="flex items-baseline">
        <span v-text="$t('slippageTolerance')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="$t('marketConditionsWarning')" class="w-52" />
        </BalTooltip>
      </div>
      <AppSlippageForm class="mt-1" />
    </div>
    <div v-if="!hideLiquidity" class="px-4 mt-6">
      <div class="flex items-baseline">
        <span v-text="$t('tradeLiquidity')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-text="$t('whichPools')" class="w-52" />
        </BalTooltip>
      </div>
      <BalBtnGroup
        :options="tradeLiquidityOptions"
        v-model="appTradeLiquidity"
        @update:modelValue="setTradeLiquidity"
      />
    </div>
    <div v-if="!isPolygon" class="px-4 mt-6">
      <div class="flex items-baseline">
        <span v-text="$t('transactionType')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-text="$t('ethereumTxTypeTooltip')" class="w-52" />
        </BalTooltip>
      </div>
      <BalBtnGroup
        :options="ethereumTxTypeOptions"
        v-model="ethereumTxType"
        @update:modelValue="setEthereumTxType"
      />
    </div>
    <!-- Hide Gnosis interface switch for now -->
    <div v-if="!isPolygon" class="px-4 mt-6">
      <div class="flex items-baseline">
        <span v-text="$t('tradeInterface')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-text="$t('tradeInterfaceTooltip')" class="w-52" />
        </BalTooltip>
      </div>
      <BalBtnGroup
        :options="tradeInterfaceOptions"
        v-model="appTradeInterface"
        @update:modelValue="setTradeInterface"
      />
      <div class="flex mt-1"></div>
    </div>
    <div
      class="network mt-4 p-4 text-sm border-t dark:border-gray-900 rounded-b-xl"
    >
      <div v-text="$t('network')" />
      <div class="flex items-baseline">
        <div
          :class="['w-2 h-2 mr-1 bg-green-400 rounded-full', networkColorClass]"
        ></div>
        {{ networkName }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, computed, toRefs } from 'vue';
import { useStore } from 'vuex';
import {
  getConnectorName,
  getConnectorLogo
} from '@/services/web3/web3.plugin';
import AppSlippageForm from '@/components/forms/AppSlippageForm.vue';
import Avatar from '@/components/images/Avatar.vue';
import useWeb3 from '@/services/web3/useWeb3';

import { APP } from '@/constants/app';
import {
  tradeLiquidityOptions,
  tradeInterfaceOptions,
  ethereumTxTypeOptions
} from '@/constants/options';
import { TradeInterface } from '@/store/modules/app';
import useEthereumTxType from '@/composables/useEthereumTxType';

const locales = {
  'en-US': 'English',
  'zh-CN': '中文',
  'es-ES': 'Español',
  'it-IT': 'Italiano',
  'fr-FR': 'Français',
  'pt-PT': 'Português',
  'ru-RU': 'Россия',
  'ko-KO': '한국어',
  'ja-JP': '日本語',
  'tr-TR': 'Türk',
  'hi-IN': 'हिंदी',
  'ar-AE': 'عربى'
};

export default defineComponent({
  components: {
    AppSlippageForm,
    Avatar
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const {
      explorerLinks,
      isPolygon,
      account,
      chainId,
      disconnectWallet,
      connector,
      isV1Supported,
      userNetworkConfig
    } = useWeb3();
    const { ethereumTxType, setEthereumTxType } = useEthereumTxType();

    // DATA
    const data = reactive({
      locales,
      tradeLiquidityOptions,
      tradeInterfaceOptions,
      copiedAddress: false
    });

    // COMPUTED
    const networkColorClass = computed(
      () => `network-${userNetworkConfig.value.shortName}`
    );
    const networkName = computed(() => userNetworkConfig.value.name);
    const appLocale = computed(() => store.state.app.locale);
    const appDarkMode = computed(() => store.state.app.darkMode);
    const appTradeLiquidity = computed(() => store.state.app.tradeLiquidity);
    const appTradeInterface = computed(() => store.state.app.tradeInterface);
    const hideLiquidity = computed(() => !isV1Supported);
    const connectorName = computed(() => getConnectorName(connector.value?.id));

    const connectorLogo = computed(() => getConnectorLogo(connector.value?.id));
    const hideDisconnect = computed(() => connector.value?.id == 'gnosis');

    // METHODS
    const setDarkMode = val => store.commit('app/setDarkMode', val);
    const setLocale = locale => store.commit('app/setLocale', locale);

    const setTradeLiquidity = tradeLiquidity =>
      store.commit('app/setTradeLiquidity', tradeLiquidity);
    const setTradeInterface = tradeInterface =>
      store.commit('app/setTradeInterface', tradeInterface);

    function copyAddress() {
      navigator.clipboard.writeText(account.value);
      data.copiedAddress = true;

      setTimeout(() => {
        data.copiedAddress = false;
      }, 2 * 1000);
    }

    return {
      // data
      ...toRefs(data),
      // constants
      APP,
      TradeInterface,
      // computed
      account,
      appTradeLiquidity,
      chainId,
      appTradeInterface,
      networkName,
      networkColorClass,
      appLocale,
      appDarkMode,
      connectorName,
      connectorLogo,
      hideLiquidity,
      hideDisconnect,
      isPolygon,
      // methods
      disconnectWallet,
      setDarkMode,
      setLocale,
      setTradeLiquidity,
      setTradeInterface,
      copyAddress,
      explorer: explorerLinks,
      ethereumTxType,
      setEthereumTxType,
      ethereumTxTypeOptions
    };
  }
});
</script>

<style scoped>
.address {
  @apply text-blue-500;
  font-variant-ligatures: no-contextual;
}

.option:hover {
  @apply text-blue-500 border-blue-500;
}

.option.active {
  @apply text-blue-500 border-blue-500;
}

.slippage-input {
  @apply bg-white;
}

.slippage-input.active {
  @apply text-blue-500 border-blue-500;
}

.network-kovan {
  background: #9064ff;
}

.network-ropsten {
  background: #ff4a8d;
}

.network-rinkeby {
  background: #f6c343;
}

.network-goerli {
  background: #3099f2;
}
</style>
