<script lang="ts" setup>
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { differenceInMilliseconds, format, parseISO } from 'date-fns';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import numeral from 'numeral';
import useLbpAuctionState from '@/beethovenx/lbp/composables/useLbpAuctionState';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import BalCard from '@/components/_global/BalCard/BalCard.vue';

const { fNum } = useNumbers();
const harvesting = ref(false);

const {
  startsAt,
  endsAt,
  isBeforeStart,
  isAfterEnd,
  collateralToken,
  launchToken,
  pool,
  data,
  loadingPool
} = useLbpAuctionState();

const timeRemaining = computed(() =>
  isBeforeStart.value
    ? differenceInMilliseconds(startsAt.value, new Date())
    : differenceInMilliseconds(endsAt.value, new Date())
);

const countdownDateFormatted = computed(() =>
  isBeforeStart.value
    ? format(startsAt.value, 'MMM d') + ' at ' + format(startsAt.value, 'HH:mm')
    : format(endsAt.value, 'MMM d') + ' at ' + format(endsAt.value, 'HH:mm')
);

const countdownLabel = computed(() =>
  isBeforeStart.value ? 'Starts In' : 'Ends In'
);

const endDateFormatted = computed(() =>
  format(endsAt.value, 'MMM d, HH:mm:ss')
);

const lbpData = computed(() => {
  const tokens = pool.value?.tokens;
  const launchToken = tokens?.find(
    token =>
      token.address.toLowerCase() ===
      data.value.tokenContractAddress.toLowerCase()
  );
  const collateralToken = tokens?.find(
    token =>
      token.address.toLowerCase() ===
      data.value.collateralTokenAddress.toLowerCase()
  );

  if (!launchToken || !collateralToken) {
    return null;
  }

  const remaining = parseFloat(launchToken.balance);
  const sold = parseFloat(data.value.tokenAmount) - remaining;
  const tokenPrice =
    ((parseFloat(launchToken.weight) / parseFloat(collateralToken.weight)) *
      parseFloat(collateralToken.balance)) /
    parseFloat(launchToken.balance);
  const predictedPrice =
    ((0.8 / 0.2) * parseFloat(collateralToken.balance)) /
    parseFloat(launchToken.balance);

  return {
    sold,
    remaining,
    percentSold: sold / parseFloat(data.value.tokenAmount),
    tokenPrice: numeral(tokenPrice).format('$0,0.0000'),
    predictedPrice: numeral(predictedPrice).format('$0,0.0000'),
    beetsWeight: numeral(parseFloat(launchToken.weight) * 100).format('0.[00]'),
    usdcWeight: numeral(parseFloat(collateralToken.weight) * 100).format(
      '0.[00]'
    )
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
  <div class="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-3 gap-4">
    <template v-if="loading">
      <BalLoadingBlock v-for="n in 3" :key="n" class="h-28" />
    </template>
    <template v-else>
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
          {{ endDateFormatted }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Current BEETS Price
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ lbpData ? fNum(lbpData.tokenPrice, 'usd') : '' }}
        </div>
        <div class="text-sm text-gray-500 font-medium mt-1">
          Predicted price*:
          {{ lbpData ? fNum(lbpData.predictedPrice, 'usd') : '' }}
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
          {{ fNum(data.tokenAmount, 'token_lg') }}
        </div>
      </BalCard>
    </template>
  </div>
</template>
