<template>
  <BalPopover>
    <template v-slot:activator>
      <BalBtn
        circle
        color="white"
        size="sm"
        class="mb-2 text-gray-500"
        @click="onActivatorClick"
      >
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
      <AppSlippageForm class="mt-1" />
    </div>
    <div v-if="!hideLiquidity" class="mt-6">
      <div class="flex items-baseline">
        <span v-text="$t('tradeLiquidity')" class="font-medium mb-2" />
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-text="$t('whichPools')" class="w-52" />
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
          {{ $t(tradeLiquidity.toLowerCase()) }}
        </div>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  toRefs,
  PropType,
  Ref
} from 'vue';
import { useStore } from 'vuex';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import { LiquiditySelection } from '@/lib/utils/balancer/helpers/sor/sorManager';
import AppSlippageForm from '@/components/forms/AppSlippageForm.vue';
import useFathom from '@/composables/useFathom';

export enum TradeSettingsContext {
  trade,
  invest
}

export default defineComponent({
  name: 'TradeSettingsPopover',

  components: {
    AppSlippageForm
  },

  props: {
    context: {
      type: [String, Number] as PropType<TradeSettingsContext>,
      required: true
    }
  },

  setup(props) {
    // DATA
    const { context }: { context: Ref<TradeSettingsContext> } = toRefs(props);

    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { explorer } = useWeb3();
    const { trackGoal, Goals } = useFathom();

    // DATA
    const data = reactive({
      tradeLiquidityOptions: Object.values(LiquiditySelection).filter(
        v => typeof v === 'string'
      )
    });

    // COMPUTED
    const appTradeLiquidity = computed(() => store.state.app.tradeLiquidity);
    const hideLiquidity = computed(
      () => context.value === TradeSettingsContext.invest
    );

    // METHODS
    const setTradeLiquidity = tradeLiquidity =>
      store.commit('app/setTradeLiquidity', tradeLiquidity);

    function onActivatorClick(): void {
      if (context.value === TradeSettingsContext.trade) {
        trackGoal(Goals.ClickTradeSettings);
      } else if (context.value === TradeSettingsContext.invest) {
        trackGoal(Goals.ClickInvestSettings);
      }
    }

    return {
      // data
      ...toRefs(data),
      Goals,
      // computed
      appTradeLiquidity,
      hideLiquidity,
      // methods
      setTradeLiquidity,
      fNum,
      explorer,
      onActivatorClick
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
