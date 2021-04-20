<template>
  <div
    class="popover-wrapper top-full invisible opacity-0 absolute z-10 pt-3 right-0"
  >
    <BalCard class="popover pt-4" shadow="lg" noPad>
      <div class="px-4">
        <h5 v-text="t('account')" />
        <div class="flex mt-1 pb-4 border-b justify-between">
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
                  <IconCopy
                    class="w-4 h-4 cursor-pointer"
                    @click="copyAddress"
                  />
                  <BalLink :href="explorer.addressLink(account)" external>
                    <IconLink class="w-4 h-4 ml-1" />
                  </BalLink>
                </div>
              </div>
              <div class="text-sm">{{ connectorName }}</div>
            </div>
          </div>
          <div class="flex items-center">
            <IconCross
              class="p-1 w-6 h-6 text-red-500 rounded-full border cursor-pointer"
              @click="logout"
            />
          </div>
        </div>
      </div>
      <div class="hidden mt-4 px-4">
        <h5 v-text="t('language')" />
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
      <div class="hidden mt-4 px-4">
        <h5 v-text="t('theme')" />
        <div class="flex mt-1">
          <div
            class="option w-16 mr-2 py-1.5 flex justify-center border rounded-xl cursor-pointer"
            :class="{ active: !appDarkMode }"
            @click="setDarkMode(false)"
          >
            <IconSun class="w-5 h-5" />
          </div>
          <div
            class="option w-16 mr-2 py-1.5 flex justify-center border rounded-xl cursor-pointer"
            :class="{ active: appDarkMode }"
            @click="setDarkMode(true)"
          >
            <IconMoon class="w-5 h-5" />
          </div>
        </div>
      </div>
      <div class="mt-4 px-4">
        <div class="flex items-baseline">
          <h5 v-text="'Slippage tolerance'" />
          <BalTooltip>
            <template v-slot:activator>
              <BalIcon
                name="info"
                size="xs"
                class="ml-1 text-gray-400 -mb-px"
              />
            </template>
            <div class="w-52">
              Market conditions may change between the time your order is
              submitted and the time it gets executed on Ethereum. Slippage
              tolerance is the maximum change in price you are willing to
              accept. This protects you from front-running bots and miner
              extractable value (MEV).
            </div>
          </BalTooltip>
        </div>
        <div class="flex mt-1">
          <div
            v-for="slippage in slippageOptions"
            :key="slippage"
            class="option w-16 mr-2 py-1 text-center border rounded-xl cursor-pointer"
            :class="{ active: appSlippage === slippage }"
            @click="setSlippage(slippage)"
          >
            {{ fNum(slippage, null, '0.0%') }}
          </div>
          <input
            class="slippage-input w-20 px-2 border rounded-xl"
            :class="{ active: isCustomSlippage }"
            v-model="slippageInput"
            :placeholder="t('custom')"
          />
        </div>
      </div>
      <div class="network mt-4 px-4 pt-2 pb-4 text-sm border-t rounded-b-xl">
        <div v-text="t('network')" />
        <div class="flex items-baseline">
          <div
            :class="[
              'w-2 h-2 mr-1 bg-green-400 rounded-full',
              networkColorClass
            ]"
          ></div>
          {{ networkName }}
        </div>
      </div>
    </BalCard>
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
const slippageOptions = ['0.005', '0.01', '0.02'];

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
      slippageOptions,
      slippageInput: ''
    });

    // COMPUTED
    const account = computed(() => store.state.web3.account);
    const networkId = computed(() => store.state.web3.config.chainId);
    const networkName = computed(() => store.state.web3.config.name);
    const networkColorClass = computed(
      () => `network-${store.state.web3.config.shortName.toLowerCase()}`
    );
    const appSlippage = computed(() => store.state.app.slippage);
    const appLocale = computed(() => store.state.app.locale);
    const appDarkMode = computed(() => store.state.app.darkMode);

    const isCustomSlippage = computed(() => {
      return !slippageOptions.includes(appSlippage.value);
    });

    const connectorName = computed(() => {
      return getConnectorName(store.state.web3.connector);
    });

    const connectorLogo = computed(() => {
      return getConnectorLogo(store.state.web3.connector);
    });

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

    function copyAddress() {
      navigator.clipboard.writeText(store.state.web3.account);
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
      networkId,
      networkName,
      networkColorClass,
      appSlippage,
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
      copyAddress,
      fNum,
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
  @apply text-blue-500 border-blue-500 font-bold;
}

.slippage-input {
  @apply bg-white;
}

.slippage-input.active {
  @apply text-blue-500 border-blue-500 font-bold;
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
