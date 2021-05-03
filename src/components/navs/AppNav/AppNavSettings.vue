<template>
  <div>
    <div class="p-4 border-b">
      <h5 v-text="t('account')" />
      <div class="flex mt-1 justify-between">
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
                      color="white"
                      size="xs"
                      @click="copyAddress"
                      class="mr-2"
                    >
                      <BalIcon v-if="copiedAddress" name="check" size="xs" />
                      <BalIcon v-else name="clipboard" size="xs" />
                    </BalBtn>
                  </template>
                  <div
                    v-text="copiedAddress ? t('copied') : t('copyAddress')"
                    class="w-20 text-center"
                  />
                </BalTooltip>
                <BalBtn
                  circle
                  color="white"
                  size="xs"
                  tag="a"
                  :href="explorer.addressLink(account)"
                  target="_blank"
                  rel="noreferrer"
                >
                  <BalIcon name="external-link" size="xs" />
                </BalBtn>
              </div>
            </div>
            <div class="text-sm">{{ connectorName }}</div>
          </div>
        </div>
        <div class="flex items-center">
          <BalBtn circle color="white" size="xs" @click="logout">
            <BalIcon class="text-red-500" name="x" size="sm" />
          </BalBtn>
        </div>
      </div>
    </div>
    <div class="hidden px-4">
      <span v-text="t('language')" class="font-medium mb-2" />
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
      <span v-text="t('theme')" class="font-medium mb-2" />
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
        <span v-text="t('slippageTolerance')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="t('marketConditionsWarning')" class="w-52" />
        </BalTooltip>
      </div>
      <div class="flex mt-1">
        <BalBtnGroup
          :options="slippageOptions"
          v-model="appSlippage"
          @update:modelValue="setSlippage"
        />
        <input
          class="slippage-input w-20 px-2 border rounded-lg"
          :class="{ active: isCustomSlippage }"
          v-model="slippageInput"
          :placeholder="t('custom')"
        />
      </div>
    </div>
    <div class="px-4 mt-6">
      <div class="flex items-baseline">
        <span v-text="t('tradeLiquidity')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-text="t('whichPools')" class="w-52" />
        </BalTooltip>
      </div>
      <BalBtnGroup
        :options="tradeLiquidityOptions"
        v-model="appTradeLiquidity"
        @update:modelValue="setTradeLiquidity"
      />
    </div>
    <div class="network mt-4 p-4 text-sm border-t rounded-b-xl">
      <div v-text="t('network')" />
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
import {
  defineComponent,
  reactive,
  onMounted,
  computed,
  toRefs,
  watch
} from 'vue';
import { useStore } from 'vuex';
import { getConnectorName, getConnectorLogo } from '@/plugins/authOptions';
import { useI18n } from 'vue-i18n';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import { LiquiditySelection } from '@/utils/balancer/helpers/sor/sorManager';

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
  'tr-TR': 'Türk'
};

export default defineComponent({
  setup() {
    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();
    const { fNum } = useNumbers();
    const { explorer } = useWeb3();

    // DATA
    const data = reactive({
      locales,
      slippageOptions: ['0.005', '0.01', '0.02'].map(option => ({
        label: fNum(option, null, { format: '0.0%' }),
        value: option
      })),
      tradeLiquidityOptions: Object.values(LiquiditySelection)
        .filter(v => typeof v === 'string')
        .map(option => ({
          label: option,
          value: option
        })),
      slippageInput: '',
      copiedAddress: false,
      appSlippage: store.state.app.slippage
    });

    // COMPUTED
    const account = computed(() => store.state.web3.account);
    const networkId = computed(() => store.state.web3.config.chainId);
    const networkName = computed(() => store.state.web3.config.name);
    const networkColorClass = computed(
      () => `network-${store.state.web3.config.shortName.toLowerCase()}`
    );
    const appLocale = computed(() => store.state.app.locale);
    const appDarkMode = computed(() => store.state.app.darkMode);
    const appSlippage = computed(() => store.state.app.slippage);
    const appTradeLiquidity = computed(() => store.state.app.tradeLiquidity);

    const isCustomSlippage = computed(
      () =>
        !Object.values(data.slippageOptions).some(
          option => option.value === appSlippage.value
        )
    );

    const connectorName = computed(() =>
      getConnectorName(store.state.web3.connector)
    );

    const connectorLogo = computed(() =>
      getConnectorLogo(store.state.web3.connector)
    );

    // CALLBACKS
    onMounted(() => {
      if (isCustomSlippage.value) {
        const slippage = parseFloat(appSlippage.value);
        data.slippageInput = (slippage * 100).toFixed(1);
      }
    });

    // METHODS
    const logout = () => store.dispatch('web3/logout');
    const setDarkMode = val => store.commit('app/setDarkMode', val);
    const setLocale = locale => store.commit('app/setLocale', locale);
    const setSlippage = slippage => store.commit('app/setSlippage', slippage);
    const setTradeLiquidity = tradeLiquidity =>
      store.commit('app/setTradeLiquidity', tradeLiquidity);

    function copyAddress() {
      navigator.clipboard.writeText(store.state.web3.account);
      data.copiedAddress = true;

      setTimeout(() => {
        data.copiedAddress = false;
      }, 2 * 1000);
    }

    // WATCHERS
    watch(
      () => data.slippageInput,
      newSlippage => {
        if (!newSlippage) return;

        const number = Number(newSlippage);
        if (!number || number <= 0) return;

        const slippage = number / 100;
        if (slippage >= 0.1) return;
        setSlippage(slippage.toString());
      }
    );

    return {
      // data
      ...toRefs(data),
      // computed
      account,
      appSlippage,
      appTradeLiquidity,
      networkId,
      networkName,
      networkColorClass,
      appLocale,
      appDarkMode,
      isCustomSlippage,
      connectorName,
      connectorLogo,
      // methods
      logout,
      setDarkMode,
      setLocale,
      setSlippage,
      setTradeLiquidity,
      copyAddress,
      t,
      explorer
    };
  }
});
</script>

<style scoped>
.popover-wrapper {
  transition: all 0.2s ease-in-out;
}
.popover-wrapper:hover {
  @apply visible opacity-100;
}

.address {
  @apply text-blue-500;
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
