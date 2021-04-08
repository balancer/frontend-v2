<template>
  <div class="popover-wrapper hidden absolute right-6 top-14 z-10 mt-2">
    <div class="w-full h-2"></div>
    <BalCard class="popover pt-4" shadow="xl" noPad>
      <div class="px-4">
        <h5 v-text="$t('account')" />
        <div class="flex mt-1 pb-4 border-b justify-between">
          <div class="flex">
            <div class="relative">
              <Avatar :address="web3.account" size="44" />
              <div class="connector-icon-wrapper">
                <img
                  :src="connectorLogo"
                  class="p-0.5 w-5 h-5 absolute bottom-0 right-0 flex items-center justify-center bg-white rounded-full"
                />
              </div>
            </div>
            <div class="ml-2">
              <div class="address flex items-baseline">
                <div v-text="_shorten(web3.account)" />
                <div class="ml-3 flex">
                  <IconCopy
                    class="w-4 h-4 cursor-pointer"
                    @click="copyAddress"
                  />
                  <a
                    :href="_explorer(web3.config.chainId, web3.account)"
                    target="_blank"
                  >
                    <IconLink class="w-4 h-4 ml-1" />
                  </a>
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
        <h5 v-text="$t('language')" />
        <div class="flex mt-1">
          <div
            v-for="(locale, localeKey) in locales"
            :key="localeKey"
            class="option w-16 mr-2 py-1 text-center border rounded-xl cursor-pointer"
            :class="{ active: app.locale === localeKey }"
            @click="setLocale(localeKey)"
          >
            {{ locale }}
          </div>
        </div>
      </div>
      <div class="hidden mt-4 px-4">
        <h5 v-text="$t('theme')" />
        <div class="flex mt-1">
          <div
            class="option w-16 mr-2 py-1.5 flex justify-center border rounded-xl cursor-pointer"
            :class="{ active: !app.darkMode }"
            @click="setDarkMode(false)"
          >
            <IconSun class="w-5 h-5" />
          </div>
          <div
            class="option w-16 mr-2 py-1.5 flex justify-center border rounded-xl cursor-pointer"
            :class="{ active: app.darkMode }"
            @click="setDarkMode(true)"
          >
            <IconMoon class="w-5 h-5" />
          </div>
        </div>
      </div>
      <div class="mt-4 px-4">
        <h5 v-text="$t('priceImpactTolerance')" />
        <div class="flex mt-1">
          <div
            v-for="slippage in slippageOptions"
            :key="slippage"
            class="option w-16 mr-2 py-1 text-center border rounded-xl cursor-pointer"
            :class="{ active: app.slippage === slippage }"
            @click="setSlippage(slippage)"
          >
            {{ _num(slippage, '0.0%') }}
          </div>
          <input
            class="slippage-input w-20 px-2 border rounded-xl"
            :class="{ active: isCustomSlippage }"
            v-model="slippageInput"
            :placeholder="$t('custom')"
          />
        </div>
      </div>
      <div class="network mt-4 px-4 pt-2 pb-4 text-sm border-t rounded-b-xl">
        <div v-text="$t('network')" />
        <div class="flex items-baseline">
          <div class="w-2 h-2 mr-1 bg-green-400 rounded-full"></div>
          {{ web3.config.name }}
        </div>
      </div>
    </BalCard>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';
import { getConnectorName, getConnectorLogo } from '@/plugins/authOptions';

const locales = {
  'en-US': 'EN',
  'zh-CN': '中文',
  'fr-FR': 'FR',
  'pt-PT': 'PT',
  'ru-RU': 'Россия'
};
const slippageOptions = ['0.005', '0.01', '0.02'];

export default {
  data() {
    return {
      locales,
      slippageOptions,
      slippageInput: ''
    };
  },
  mounted() {
    if (this.isCustomSlippage) {
      const slippage = parseFloat(this.app.slippage);
      this.slippageInput = (slippage * 100).toFixed(1);
    }
  },
  methods: {
    ...mapActions(['logout']),
    ...mapMutations(['setDarkMode', 'setLocale', 'setSlippage']),
    copyAddress() {
      const address = this.web3.account;
      navigator.clipboard.writeText(address);
    }
  },
  computed: {
    isCustomSlippage() {
      return !slippageOptions.includes(this.app.slippage);
    },
    connectorName() {
      return getConnectorName(this.web3.connector);
    },
    connectorLogo() {
      return getConnectorLogo(this.web3.connector);
    }
  },
  watch: {
    slippageInput(newValue) {
      if (!newValue) {
        return;
      }
      const number = parseFloat(newValue);
      if (!number) {
        return;
      }
      if (number <= 0) {
        return;
      }
      const slippage = number / 100;
      if (slippage >= 0.1) {
        return;
      }
      this.setSlippage(slippage.toString());
    }
  }
};
</script>

<style scoped>
.popover-wrapper:hover {
  display: initial;
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
</style>
