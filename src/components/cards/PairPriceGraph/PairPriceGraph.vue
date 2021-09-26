<template>
  <div ref="elementToAnimate" class="priceGraphCard">
    <BalCard hFull noShadow>
      <div class="relative">
        <button v-if="!upToLargeBreakpoint" @click="toggle" class="maximise">
          <BalIcon name="maximize-2" class="text-gray-500" />
        </button>
        <div>
          <h6 class="font-medium">{{ inputSym }}/{{ outputSym }}</h6>
        </div>
        <BalLoadingBlock v-if="isLoadingPriceData" class="h-24" />
        <div class="">
          <BalLineChart
            :isLoading="isLoadingPriceData || appLoading"
            :data="chartData"
            :height="chartHeight"
            hide-y-axis
            :showLegend="false"
            :color="chartColors"
            showHeader
            :forceResizeTick="resizeTick"
            :customGrid="chartGrid"
            :axisLabelFormatter="{ yAxis: '0.0000000' }"
          />
        </div>
      </div>
    </BalCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';
import anime from 'animejs';
import { useStore } from 'vuex';
import useTokens from '@/composables/useTokens';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { useQuery } from 'vue-query';
import { last, mapKeys, mapValues, nth, toPairs } from 'lodash';
import { fromUnixTime, format } from 'date-fns';
import useTailwind from '@/composables/useTailwind';
import useBreakpoints from '@/composables/useBreakpoints';
const easing = 'spring(0.5, 100, 18, 0)';

async function getPairPriceData(
  inputAsset: string,
  outputAsset: string,
  days: number
) {
  const inputAssetData = await coingeckoService.prices.getTokensHistorical(
    [inputAsset],
    days
  );
  const outputAssetData = await coingeckoService.prices.getTokensHistorical(
    [outputAsset],
    days
  );

  const calculatedPricing = mapValues(inputAssetData, (value, timestamp) => {
    return (1 / value[0]) * outputAssetData[timestamp][0];
  });

  const formatTimestamps = mapKeys(calculatedPricing, (_, timestamp: any) =>
    format(fromUnixTime(timestamp / 1000), 'yyyy/MM/dd')
  );

  return toPairs(formatTimestamps);
}

export default defineComponent({
  setup() {
    const elementToAnimate = ref<HTMLElement>();
    const { upToLargeBreakpoint } = useBreakpoints();
    const chartHeight = ref(upToLargeBreakpoint ? 125 : 200);
    const isExpanded = ref(false);
    const animateInstance = ref();
    const store = useStore();
    const { tokens } = useTokens();
    const tailwind = useTailwind();
    const resizeTick = ref(0);
    const inputAsset = computed(() => store.state.trade.inputAsset);
    const outputAsset = computed(() => store.state.trade.outputAsset);
    const appLoading = computed(() => store.state.app.loading);

    const inputSym = computed(() => tokens.value[inputAsset.value]?.symbol);
    const outputSym = computed(() => tokens.value[outputAsset.value]?.symbol);

    const {
      isLoading: isLoadingPriceData,
      data: priceData
    } = useQuery(reactive(['pairPriceData', { inputAsset, outputAsset }]), () =>
      getPairPriceData(inputAsset.value, outputAsset.value, 7)
    );

    const maximise = () => {
      if (elementToAnimate.value) {
        anime.set(elementToAnimate.value, {
          position: 'absolute',
          right: 0
        });
      }
      window.requestAnimationFrame(() => {
        animateInstance.value = anime({
          targets: elementToAnimate.value,
          width: '750px',
          height: '440px',
          right: '130px',
          easing,
          update: () => {
            resizeTick.value = resizeTick.value + 1;
            chartHeight.value =
              (elementToAnimate.value?.offsetHeight || 0) * 0.7;
          }
        });
        isExpanded.value = true;
      });
    };

    const minimise = () => {
      requestAnimationFrame(() => {
        anime({
          targets: elementToAnimate.value,
          width: '250px',
          height: '250px',
          right: '0',
          easing,
          update: () => {
            resizeTick.value = resizeTick.value + 1;
            chartHeight.value =
              (elementToAnimate.value?.offsetHeight || 0) * 0.5;
          }
        });
        isExpanded.value = false;
      });
    };

    const toggle = () => {
      if (isExpanded.value) {
        minimise();
      } else {
        maximise();
      }
    };

    const chartData = computed(() => [
      {
        name: `${inputSym.value}/${outputSym.value}`,
        values: priceData.value || []
      }
    ]);

    const chartColors = computed(() => {
      let color = tailwind.theme.colors.green['400'];
      const _priceData = priceData.value || [];
      if (_priceData.length > 2) {
        if (_priceData[_priceData.length - 1][1] < _priceData[_priceData.length - 2][1]) {
          color = tailwind.theme.colors.red['400'];
        }
      }
      return [color];
    });

    const chartGrid = computed(() => {
      const bottom = isExpanded.value ? '7.5%' : '15%';
      return {
        left: '2.5%',
        right: '0',
        top: '10%',
        bottom,
        containLabel: false
      };
    });

    return {
      elementToAnimate,
      toggle,
      inputSym,
      outputSym,
      isLoadingPriceData,
      chartData,
      console,
      chartColors,
      appLoading,
      resizeTick,
      chartHeight,
      chartGrid,
      upToLargeBreakpoint
    };
  }
});
</script>

<style scoped>
.maximise {
  @apply absolute;
  right: 0;
  top: 0;
}

.priceGraphCard {
  height: 250px;
}
</style>
