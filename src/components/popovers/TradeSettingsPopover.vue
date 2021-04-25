<template>
  <BalPopover>
    <template v-slot:activator>
      <BalBtn circle color="white" class="mb-2 text-gray-500">
        <BalIcon name="settings" size="sm" />
      </BalBtn>
    </template>

    <div>
      <div class="flex items-baseline">
        <span v-text="$t('slippageTolerance')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="$t('marketConditionsWarning')" class="w-52" />
        </BalTooltip>
      </div>
      <div class="flex mt-1">
        <div
          v-for="slippage in slippageOptions"
          :key="slippage"
          class="trade-settings-option w-16 mr-2 py-1 text-center border rounded-lg cursor-pointer"
          :class="{ active: appSlippage === slippage }"
          @click="setSlippage(slippage)"
        >
          {{ fNum(slippage, null, '0.0%') }}
        </div>
        <input
          class="slippage-input w-20 px-2 border rounded-lg"
          :class="{ active: isCustomSlippage }"
          v-model="slippageInput"
          :placeholder="$t('custom')"
        />
      </div>
    </div>
    <div v-if="!hideLiquidity" class="mt-6">
      <div class="flex items-baseline">
        <span v-text="$t('tradeLiquidity')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div
            v-text="
              'Which liquidity pools should be used when you make a trade.'
            "
            class="w-52"
          />
        </BalTooltip>
      </div>
      <div class="flex mt-1">
        <div
          v-for="(tradeLiquidity, i) in tradeLiquidityOptions"
          :key="i"
          class="trade-settings-option w-16 mr-2 py-1 text-center border rounded-lg cursor-pointer capitalize"
          :class="{ active: appTradeLiquidity === tradeLiquidity }"
          @click="setTradeLiquidity(tradeLiquidity)"
        >
          {{ tradeLiquidity }}
        </div>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  onMounted,
  computed,
  toRefs,
  watch
} from 'vue';
import { useStore } from 'vuex';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import { LiquiditySelection } from '@/utils/balancer/helpers/sor/sorManager';

const slippageOptions = ['0.005', '0.01', '0.02'];

export default defineComponent({
  name: 'TradeSettingsPopover',

  props: {
    hideLiquidity: { type: Boolean, default: false }
  },

  setup() {
    const store = useStore();
    const { fNum } = useNumbers();
    const { explorer } = useWeb3();

    // DATA
    const data = reactive({
      slippageOptions,
      tradeLiquidityOptions: Object.values(LiquiditySelection).filter(
        v => typeof v === 'string'
      ),
      slippageInput: ''
    });

    // COMPUTED
    const appSlippage = computed(() => store.state.app.slippage);
    const appTradeLiquidity = computed(() => store.state.app.tradeLiquidity);

    const isCustomSlippage = computed(() => {
      return !slippageOptions.includes(appSlippage.value);
    });

    // CALLBACKS
    onMounted(() => {
      if (isCustomSlippage.value) {
        const slippage = parseFloat(appSlippage.value);
        data.slippageInput = (slippage * 100).toFixed(1);
      }
    });

    // METHODS
    const setSlippage = slippage => store.commit('app/setSlippage', slippage);
    const setTradeLiquidity = tradeLiquidity =>
      store.commit('app/setTradeLiquidity', tradeLiquidity);

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
      appSlippage,
      appTradeLiquidity,
      isCustomSlippage,
      // methods
      setSlippage,
      setTradeLiquidity,
      fNum,
      explorer
    };
  }
});
</script>

<style>
.trade-settings-option:hover {
  @apply text-blue-500 border-blue-500;
}

.trade-settings-option.active {
  @apply text-blue-500 border-blue-500;
}
</style>
