<template>
  <div ref="elementToAnimate" class="priceGraphCard">
    <BalLoadingBlock v-if="isLoadingPriceData" class="h-64" />
    <BalCard hFull noShadow v-else>
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
        <div
          v-if="failedToLoadPriceData"
          class="h-full w-full flex justify-center items-center"
        >
          <span class="text-sm text-gray-400">Not enough data</span>
        </div>
        <div v-if="!failedToLoadPriceData && !isLoadingPriceData">
          <BalLineChart
            :data="chartData"
            :height="chartHeight"
            hide-y-axis
            hide-x-axis
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
import {
  Dictionary,
  mapKeys,
  mapValues,
  pickBy,
  toPairs
} from 'lodash';
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
    days,
    1,
    'hour'
  );

  const outputAssetData = await coingeckoService.prices.getTokensHistorical(
    [outputAsset],
    days,
    1,
    'hour'
  );

  const calculatedPricing = mapValues(inputAssetData, (value, timestamp) => {
    if (!outputAssetData[timestamp]) return null;
    return (1 / value[0]) * outputAssetData[timestamp][0];
  });

  const calculatedPricingNoNulls = pickBy(calculatedPricing) as Dictionary<
    number
  >;

  const formatTimestamps = mapKeys(
    calculatedPricingNoNulls,
    (_, timestamp: any) => format(fromUnixTime(timestamp), 'yyyy/MM/dd HH:mm')
  );
  return toPairs(formatTimestamps);
}

export default defineComponent({
  setup() {
    const elementToAnimate = ref<HTMLElement>();
    const { upToLargeBreakpoint } = useBreakpoints();
    const chartHeight = ref(upToLargeBreakpoint ? 75 : 100);
    const isExpanded = ref(false);
    const animateInstance = ref();
    const store = useStore();
    const { tokens } = useTokens();
    const tailwind = useTailwind();
    const resizeTick = ref(0);
    const { tokenInAddress, tokenOutAddress } = useTradeState();
    const appLoading = computed(() => store.state.app.loading);

    const inputSym = computed(
      () => tokens.value[getAddress(tokenInAddress.value)]?.symbol
    );
    const outputSym = computed(
      () => tokens.value[getAddress(tokenOutAddress.value)]?.symbol
    );

    const shouldLoadPriceData = computed(
      () => tokenInAddress.value !== '' && tokenOutAddress.value !== ''
    );

    const {
      isLoading: isLoadingPriceData,
      data: priceData,
      error: failedToLoadPriceData
    } = useQuery(
      reactive(['pairPriceData', { tokenInAddress, tokenOutAddress }]),
      () => getPairPriceData(tokenInAddress.value, tokenOutAddress.value, 1),
      reactive({
        retry: false,
        shouldLoadPriceData,
        // when refetch on window focus in enabled, it causes a flash
        // in the loading state of the card which is jarring. disabling it
        refetchOnWindowFocus: false
      })
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
  height: 200px;
}
</style>
