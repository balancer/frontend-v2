<template>
  <div ref="elementToAnimate" class="priceGraphCard">
    <BalCard hFull noShadow>
      <div class="relative h-full">
        <button
          v-if="
            !upToLargeBreakpoint &&
              !failedToLoadPriceData &&
              !(isLoadingPriceData || appLoading)
          "
          @click="toggle"
          class="maximise"
        >
          <BalIcon name="maximize-2" class="text-gray-500" />
        </button>
        <div
          v-if="!failedToLoadPriceData && !(isLoadingPriceData || appLoading)"
        >
          <h6 class="font-medium">{{ inputSym }}/{{ outputSym }}</h6>
        </div>
        <div v-if="failedToLoadPriceData" class="h-full w-full flex justify-center items-center">
          <span class="text-sm text-gray-400">Not enough data</span>
        </div>
        <BalLoadingBlock v-if='isLoadingPriceData' class="h-32" />
        <div v-if="!failedToLoadPriceData && !isLoadingPriceData">
          <BalLineChart
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
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import anime from 'animejs';
import { useStore } from 'vuex';
import useTokens from '@/composables/useTokens';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { useQuery } from 'vue-query';
import { last, mapKeys, mapValues, nth, toPairs } from 'lodash';
import { fromUnixTime, format } from 'date-fns';
import useTailwind from '@/composables/useTailwind';
import useBreakpoints from '@/composables/useBreakpoints';
import { useTradeState } from '@/composables/trade/useTradeState';
import { getAddress } from '@ethersproject/address';
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
    const { tokenInAddress, tokenOutAddress } = useTradeState();
    const appLoading = computed(() => store.state.app.loading);

    const inputSym = computed(() => tokens.value[getAddress(tokenInAddress.value)]?.symbol);
    const outputSym = computed(() => tokens.value[getAddress(tokenOutAddress.value)]?.symbol);

    const {
      isLoading: isLoadingPriceData,
      data: priceData,
      error: failedToLoadPriceData
    } = useQuery(reactive(['pairPriceData', { tokenInAddress, tokenOutAddress }]), () =>
      getPairPriceData(tokenInAddress.value, tokenOutAddress.value, 7),
      {
        retry: false
      }
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
        if (
          _priceData[_priceData.length - 1][1] <
          _priceData[_priceData.length - 2][1]
        ) {
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
      upToLargeBreakpoint,
      failedToLoadPriceData
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
