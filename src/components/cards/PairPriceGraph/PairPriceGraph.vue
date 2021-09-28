<template>
  <div ref="elementToAnimate" class="priceGraphCard">
    <BalLoadingBlock
      v-if="isLoadingPriceData"
      :class="{
        'h-64': !isExpanded,
        'h-96': isExpanded
      }"
    />
    <BalCard hFull :shadow="false" v-else>
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
        <div
          v-if="!failedToLoadPriceData && !isLoadingPriceData"
          class="flex-col"
        >
          <BalLineChart
            :data="chartData"
            :height="chartHeight"
            :show-legend="false"
            :color="chartColors"
            :force-resize-tick="resizeTick"
            :custom-grid="chartGrid"
            :axis-label-formatter="{ yAxis: '0.0000000' }"
            hide-y-axis
            hide-x-axis
            show-header
          />
          <div class="w-full flex justify-between" v-if="isExpanded">
            <div>
              <button
                v-for="timespan in chartTimespans"
                @click="activeTimespan = timespan"
                :key="timespan.value"
                :class="[
                  'py-1 px-2 text-sm rounded-lg mr-2',
                  {
                    'bg-green-500 text-white':
                      activeTimespan.value === timespan.value,
                    'text-gray-500': activeTimespan.value !== timespan.value
                  }
                ]"
              >
                {{ timespan.option }}
              </button>
            </div>
            <div>
              <span class="text-sm text-gray-500 mr-4">Low: {{ dataMin.toPrecision(6) }}</span>
              <span class="text-sm text-gray-500">High: {{ dataMax.toPrecision(6) }}</span>
            </div>
          </div>
          <div class="mt-2" v-else>
            <span class="text-sm text-gray-500 w-full flex justify-end">{{
              activeTimespan.option
            }}</span>
          </div>
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
import { Dictionary, mapKeys, mapValues, maxBy, minBy, pickBy, toPairs } from 'lodash';
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
  const aggregateBy = days === 1 ? 'hour' : 'day';
  const inputAssetData = await coingeckoService.prices.getTokensHistorical(
    [inputAsset],
    days,
    1,
    aggregateBy
  );

  const outputAssetData = await coingeckoService.prices.getTokensHistorical(
    [outputAsset],
    days,
    1,
    aggregateBy
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
    (_, timestamp: any) =>
      format(fromUnixTime(timestamp / 1000), 'yyyy/MM/dd HH:mm')
  );
  return toPairs(formatTimestamps);
}

const chartTimespans = [
  {
    option: '1d',
    value: 1
  },
  {
    option: '1w',
    value: 7
  },
  {
    option: '1m',
    value: 30
  },
  {
    option: '1y',
    value: 365
  },
  {
    option: 'All',
    value: -1
  }
];

export default defineComponent({
  setup() {
    const elementToAnimate = ref<HTMLElement>();
    const { upToLargeBreakpoint } = useBreakpoints();
    const chartHeight = ref(upToLargeBreakpoint ? 75 : 100);
    const activeTimespan = ref(chartTimespans[0]);
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
      reactive([
        'pairPriceData',
        { tokenInAddress, tokenOutAddress, activeTimespan }
      ]),
      () =>
        getPairPriceData(
          tokenInAddress.value,
          tokenOutAddress.value,
          activeTimespan.value.value
        ),
      reactive({
        retry: false,
        shouldLoadPriceData,
        // when refetch on window focus in enabled, it causes a flash
        // in the loading state of the card which is jarring. disabling it
        refetchOnWindowFocus: false
      })
    );

    const dataMin = computed(() => {
      return (minBy(priceData.value || [], v => v[1]) || [])[1] || 0;
    });

    const dataMax = computed(() => {
      return (maxBy(priceData.value || [], v => v[1]) || [])[1] || 0;
    });

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
          // h-96
          height: '384px',
          right: '130px',
          easing,
          update: () => {
            resizeTick.value = resizeTick.value + 1;
            chartHeight.value =
              (elementToAnimate.value?.offsetHeight || 0) * 0.6;
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
          height: '225px',
          right: '0',
          easing,
          update: () => {
            resizeTick.value = resizeTick.value + 1;
            chartHeight.value = upToLargeBreakpoint ? 75 : 100;
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
      failedToLoadPriceData,
      chartTimespans,
      activeTimespan,
      isExpanded,
      dataMin,
      dataMax,
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
  height: 225px;
}
</style>
