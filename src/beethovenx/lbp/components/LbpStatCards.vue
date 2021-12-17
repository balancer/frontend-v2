<script lang="ts" setup>
import { computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { differenceInMilliseconds, format } from 'date-fns';
import { FullPool } from '@/services/balancer/subgraph/types';
import numeral from 'numeral';
import useLge from '@/beethovenx/lbp/composables/useLge';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';

type Props = {
  lge: GqlLge;
  pool: FullPool;
};

const props = defineProps<Props>();

const { fNum } = useNumbers();

const {
  startsAt,
  endsAt,
  isBeforeStart,
  poolCollateralToken,
  poolLaunchToken,
  launchToken,
  collateralTokenPrice,
  collateralToken
} = useLge(props.lge, props.pool);

const timeRemaining = computed(() =>
  isBeforeStart.value
    ? differenceInMilliseconds(startsAt.value, new Date())
    : differenceInMilliseconds(endsAt.value, new Date())
);

const countdownLabel = computed(() =>
  isBeforeStart.value ? 'Starts In' : 'Ends In'
);

const startDateFormatted = computed(() =>
  format(startsAt.value, 'MMM d, HH:mm')
);
const endDateFormatted = computed(() => format(endsAt.value, 'MMM d, HH:mm'));
const fundsRaised = computed(
  () =>
    parseFloat(poolCollateralToken.value?.balance || '') -
    parseFloat(props.lge.collateralAmount)
);
const fundsRaisedValue = computed(
  () => fundsRaised.value * collateralTokenPrice.value
);

const lbpData = computed(() => {
  const lge = props.lge;

  if (!poolLaunchToken.value || !poolCollateralToken.value) {
    return null;
  }

  const remaining = parseFloat(poolLaunchToken.value.balance);
  const sold = parseFloat(lge.tokenAmount) - remaining;
  const tokenPrice =
    ((parseFloat(poolLaunchToken.value.weight) /
      parseFloat(poolCollateralToken.value.weight)) *
      parseFloat(poolCollateralToken.value.balance)) /
    parseFloat(poolLaunchToken.value.balance);
  const predictedPrice =
    ((0.8 / 0.2) * parseFloat(poolCollateralToken.value.balance)) /
    parseFloat(poolLaunchToken.value.balance);

  return {
    sold,
    remaining,
    percentSold: sold / parseFloat(lge.tokenAmount),
    tokenPrice: numeral(tokenPrice).format('$0,0.0000'),
    predictedPrice: numeral(predictedPrice).format('$0,0.0000'),
    beetsWeight: numeral(parseFloat(poolLaunchToken.value.weight) * 100).format(
      '0.[00]'
    ),
    usdcWeight: numeral(
      parseFloat(poolCollateralToken.value.weight) * 100
    ).format('0.[00]')
  };
});

function transformTime(slotProps) {
  return {
    ...slotProps,
    hours: slotProps.hours < 10 ? `0${slotProps.hours}` : slotProps.hours,
    minutes:
      slotProps.minutes < 10 ? `0${slotProps.minutes}` : slotProps.minutes,
    seconds:
      slotProps.seconds < 10 ? `0${slotProps.seconds}` : slotProps.seconds
  };
}
</script>

<template>
  <div class="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-4 mb-4">
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        {{ countdownLabel }}
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        <vue-countdown
          :time="timeRemaining"
          v-slot="{ days, hours, minutes, seconds }"
          :transform="transformTime"
        >
          {{
            days > 1
              ? `${days} days`
              : days === 1
              ? '1 day'
              : `${hours}:${minutes}:${seconds}`
          }}
        </vue-countdown>
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        {{ startDateFormatted }} - {{ endDateFormatted }}
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        Current {{ launchToken?.symbol }} Price
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ lbpData ? lbpData.tokenPrice : '' }}
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        Predicted price*:
        {{ lbpData ? lbpData.predictedPrice : '' }}
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        Tokens Sold
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ lbpData ? fNum(lbpData.percentSold, 'percent') : '' }}
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        {{ lbpData ? fNum(lbpData.sold, 'token_lg') : '' }} of
        {{ fNum(lge.tokenAmount, 'token_lg') }}
      </div>
    </BalCard>
  </div>
  <!--  <div class="grid grid-cols-4 sm:grid-cols-3 xl:grid-cols-3 gap-4">
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        Current Weights
      </div>
      <div class="text-xl font-medium items-center flex">
        <span class="mr-1">{{
          fNum(poolLaunchToken?.weight || '0', 'percent_lg')
        }}</span>
        <BalAsset
          :address="props.lge.tokenContractAddress"
          :iconURI="props.lge.tokenIconUrl"
        />
        <span class="mx-2">/</span>
        <span class="mr-1">{{
          fNum(poolCollateralToken?.weight || '0', 'percent_lg')
        }}</span>
        <BalAsset :address="props.lge.collateralTokenAddress" />
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        <div>
          Ending:
          <span class="mr-1">{{ props.lge.tokenEndWeight }}%</span>
          <BalAsset
            :address="props.lge.tokenContractAddress"
            :iconURI="props.lge.tokenIconUrl"
            :size="18"
          />
          <span class="mx-1">/</span>
          <span class="mr-1">{{ props.lge.collateralEndWeight }}%</span>
          <BalAsset :address="props.lge.collateralTokenAddress" :size="18" />
        </div>
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        Volume
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ fNum(props.pool.totalSwapVolume, 'usd_m') }}
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        Liquidity: {{ fNum(props.pool.totalLiquidity, 'usd_lg') }}
      </div>
    </BalCard>
    <BalCard>
      <div class="text-sm text-gray-500 font-medium mb-2">
        Funds Raised
      </div>
      <div class="text-xl font-medium truncate flex items-center">
        {{ fNum(fundsRaised, 'usd') }}
      </div>
      <div class="text-sm text-gray-500 font-medium mt-1">
        {{ fNum(fundsRaised, 'token') }} {{ collateralToken?.symbol }}
      </div>
    </BalCard>
  </div>-->
</template>
