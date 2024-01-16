<script setup lang="ts">
import { useLock } from '@/composables/useLock';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { differenceInDays, format } from 'date-fns';
import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import rank from '@/assets/images/icons/rank.svg';
import share from '@/assets/images/icons/share.svg';
import hourglass from '@/assets/images/icons/hourglass.svg';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts/core';
import useVeBal from '@/composables/useVeBAL';
import { useI18n } from 'vue-i18n';
import {
  LockSnapshot,
  useHistoricalLocksQuery,
} from '@/composables/queries/useHistoricalLocksQuery';
import { useLockRankQuery } from '@/composables/queries/useLockRankQuery';
import VeBALMarketingHeader from './VeBALMarketingHeader.vue';
import BigNumber from 'bignumber.js';

type ChartValueAcc = (readonly [string, number])[];

/**
 * COMPOSABLES
 */
const { account, isWalletReady, isWalletDisconnected } = useWeb3();

const { isLoadingLockPool, isLoadingLockInfo, lock } = useLock();
const { fNum } = useNumbers();
const router = useRouter();

const { veBalBalance, isLoading: isLoadingVebalBalance } = useVeBal();
const { t } = useI18n();
const { isLoading, data: userHistoricalLocks } =
  useHistoricalLocksQuery(account);
const { isLoading: isLoadingLockBoard, data: userRankData } =
  useLockRankQuery(account);

/**
 * COMPUTED
 */
const showVebalInfo = computed(() => {
  if (isWalletDisconnected.value) return false;

  const hasVebalBalance = bnum(veBalBalance.value).isGreaterThan(0);
  const hasHistoricalLocks = userHistoricalLocks.value?.lockSnapshots.length;

  return (
    (isWalletReady.value && (hasVebalBalance || hasHistoricalLocks)) ||
    isLoadingData.value
  );
});

const isLoadingData = computed(() => {
  return (
    isLoadingLockBoard.value ||
    isLoading.value ||
    isLoadingLockInfo.value ||
    isLoadingLockPool.value ||
    isLoadingVebalBalance.value
  );
});

const lockedUntil = computed(() => {
  if (lock.value?.hasExistingLock && !lock.value.isExpired) {
    return format(lock.value.lockedEndDate, PRETTY_DATE_FORMAT);
  }

  return '—';
});

// calculate point 2 values
function calculatePoint2Balance(
  snapshot: LockSnapshot,
  slope: BigNumber,
  now: BigNumber
) {
  const point2V = bnum(snapshot.bias).minus(
    slope.times(now.minus(snapshot.timestamp))
  );
  const point2Balance = point2V.isLessThan(0)
    ? bnum(0).toNumber()
    : point2V.toNumber();
  return point2Balance;
}

// format dates
function formatDate(timestamp: number) {
  return format(timestamp * 1000, 'yyyy/MM/dd');
}

// process lock snapshots
function processLockSnapshots(lockSnapshots: LockSnapshot[]) {
  const currentDate = (Date.now() / 1000).toFixed(0);

  return lockSnapshots.reduce((acc: ChartValueAcc, snapshot, i) => {
    const slope = bnum(snapshot.slope);
    const now = lockSnapshots[i + 1]
      ? bnum(lockSnapshots[i + 1].timestamp)
      : bnum(currentDate);

    // point 1
    const point1Balance = bnum(snapshot.bias).toNumber();
    const point1Date = formatDate(snapshot.timestamp);

    // point 2
    const point2Balance = calculatePoint2Balance(snapshot, slope, now);
    const point2Date = formatDate(now.toNumber());

    acc.push(Object.freeze([point1Date, point1Balance]));

    // filter out point 2 if it's the same as point 1
    if (point1Balance.toFixed(2) !== point2Balance.toFixed(2)) {
      acc.push(Object.freeze([point2Date, point2Balance]));
    }

    return acc;
  }, []);
}

// group values by dates
function groupValuesByDates(chartValues: ChartValueAcc) {
  return chartValues.reduce((acc, item) => {
    const [date, value] = item;
    if (acc[date]) {
      acc[date].push(value);
    } else {
      acc[date] = [value];
    }
    return acc;
  }, {});
}

// filter and flatten values
function filterAndFlattenValues(valuesByDates) {
  return Object.keys(valuesByDates).reduce((acc: ChartValueAcc, item) => {
    const values = valuesByDates[item];

    let filteredValues =
      values.length > 2 ? [Math.min(...values), Math.max(...values)] : values;

    filteredValues.forEach((val: number) => {
      acc.push(Object.freeze([item, val]));
    });
    return acc;
  }, []);
}

const chartValues = computed(() => {
  if (!userHistoricalLocks.value) return [];

  const processedValues = processLockSnapshots(
    userHistoricalLocks.value.lockSnapshots
  );

  const valuesByDates = groupValuesByDates(processedValues);
  const filteredArr = filterAndFlattenValues(valuesByDates);

  return filteredArr;
});

const userRank = computed(() => {
  if (!userRankData.value) return '';
  return userRankData.value.veBalGetUser.rank;
});

const vebalInfo = computed(() => {
  const arr: { icon: any; value: string }[] = [];
  const hasVebalBalance = bnum(veBalBalance.value).isGreaterThan(0);
  if (hasVebalBalance) {
    arr.push({
      icon: share,
      value: t('veBAL.myVeBAL.cards.myVeBAL.secondaryText', [
        fNum(
          bnum(veBalBalance.value)
            .div(lock.value?.totalSupply || 0)
            .toString(),
          {
            style: 'percent',
            maximumFractionDigits: 4,
          }
        ),
      ]),
    });
  }

  if (hasVebalBalance && userRank.value) {
    arr.unshift({
      icon: rank,
      value: `Rank ${userRank.value}`,
    });
  }

  if (lock.value?.hasExistingLock && !lock.value.isExpired) {
    arr.push({
      icon: hourglass,
      value: `Expires ${lockedUntil.value} (${differenceInDays(
        new Date(lockedUntil.value),
        new Date()
      )} days)`,
    });
  }
  return arr;
});

const futureLockChartData = computed(() => {
  if (lock.value?.hasExistingLock && !lock.value.isExpired) {
    return {
      name: '',
      values: [
        chartValues.value[chartValues.value.length - 1],
        Object.freeze<[string, number]>([
          format(new Date(lockedUntil.value).getTime(), 'yyyy/MM/dd'),
          0,
        ]),
      ],
      hoverBorderColor: 'black',
      hoverColor: 'white',
    };
  }
  return { name: '', values: [] };
});

const chartData = computed(() => {
  return {
    color: ['#BCA25D', '#BCA25D'],
    hoverBorderColor: 'black',
    hoverColor: '#BCA25D',
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: 'rgba(14, 165, 233, 0.08)',
        },
        {
          offset: 1,
          color: 'rgba(68, 9, 236, 0)',
        },
      ]),
    },
    chartType: 'line',
    data: [
      {
        name: '',
        values: chartValues.value,
      },
      futureLockChartData.value,
    ],
    lineStyles: [{}, { type: 'dashed' }],
    symbolSize: 10,
  };
});

/**
 * METHODS
 */
function navigateToGetVeBAL() {
  router.push({
    name: 'get-vebal',
    query: {
      returnRoute: 'vebal',
    },
  });
}
</script>

<template>
  <div class="hero-container">
    <div class="hero-content">
      <div
        v-if="showVebalInfo"
        class="flex flex-col xl:flex-row flex-grow gap-6 justify-between xl:items-center px-10 h-full text-white"
      >
        <BalLoadingBlock v-if="isLoadingData" darker class="w-full h-full" />
        <div v-else class="flex flex-col flex-1">
          <div class="mb-2 text-xl font-bold">My veBAL</div>
          <div class="mb-10 text-5xl font-black">
            {{ fNum(veBalBalance, FNumFormats.token) }}
          </div>

          <div class="flex flex-col gap-2 mb-8">
            <div v-for="item in vebalInfo" :key="item.value" class="flex">
              <img class="mr-2 w-6 h-6" :src="item.icon" />
              <span class="font-semibold">{{ item.value }} </span>
            </div>
          </div>

          <div>
            <BalBtn class="mr-3 btn-gold" @click="navigateToGetVeBAL">
              {{ $t('veBAL.hero.buttons.getVeBAL') }}
            </BalBtn>

            <BalBtn
              color="transparent"
              class="mr-3 btn-extend"
              @click="navigateToGetVeBAL"
            >
              Extend lock
            </BalBtn>
          </div>
        </div>
        <BalLoadingBlock v-if="isLoadingData" darker class="w-full h-full" />

        <div
          v-else-if="chartData.data[0].values.length > 0"
          class="p-5 w-full rounded-2xl flex-[1.5] chart-wrapper"
        >
          <BalChart
            :isLoading="isLoadingData"
            height="96"
            :data="chartData.data"
            :axisLabelFormatter="{
              yAxis: {
                maximumFractionDigits: 2,
                fixedFormat: false,
                abbreviate: false,
              },
            }"
            :areaStyle="chartData.areaStyle"
            :color="chartData.color"
            :hoverColor="chartData.hoverColor"
            :hoverBorderColor="chartData.hoverBorderColor"
            :xAxisMinInterval="3600 * 1000 * 24 * 30"
            :showLegend="false"
            :chartType="chartData.chartType"
            showTooltipLayer
            :lineStyles="chartData.lineStyles"
            :symbolSize="chartData.symbolSize"
            :customGrid="{
              left: '2.5%',
              right: '2.5%',
              top: '10%',
              bottom: '5%',
              containLabel: true,
            }"
            reverseParams
            paramsLabel="veBAL"
            showTooltip
          />
        </div>
        <BalBlankSlate v-else class="w-full h-96 flex-[1.5]" align="center">
          <BalIcon name="bar-chart" />
          {{ $t('insufficientData') }}
        </BalBlankSlate>
      </div>

      <VeBALMarketingHeader v-else />
    </div>
  </div>
</template>

<style scoped>
.btn-gold {
  background: linear-gradient(45deg, #977622, #ccb373);
  transition: 0.5s all ease-in-out;
}

.btn-gold:hover {
  background: linear-gradient(-45deg, #ae8d39, #684e09);
}

.btn-extend {
  color: rgb(188 162 93 / 100%);
  border: 1px solid rgb(188 162 93 / 100%);
}

.chart-wrapper {
  background-color: rgb(0 0 0 / 80%);
  backdrop-filter: drop-shadow(40px 40px 80px rgb(0 0 0 / 50%));
}

.hero-container {
  @apply flex content-center relative w-full;

  min-height: 440px;
  z-index: 0;
  background-color: #0b0f19;
}

.dark .hero-container {
  background-color: #0e1420;
}

.hero-container::before {
  content: ' ';
  background-image: url('/images/patterns/fish-scale.png');
  background-repeat: repeat;

  @apply block absolute left-0 top-0 w-full h-full opacity-10 z-0;
}

.dark .hero-container::before {
  opacity: 0.07;
}

.hero-container::after {
  content: ' ';
  background: linear-gradient(45deg, rgb(0 0 0 / 100%), rgb(0 0 0 / 50%)),
    url('/images/backgrounds/vebal-hero-noise.svg');

  @apply block absolute left-0 top-0 w-full h-full bg-no-repeat bg-cover opacity-20 z-0;

  min-height: 440px;
}

.hero-content {
  @apply flex flex-col md:flex-row md:items-center max-w-screen-2xl mx-auto md:gap-4 lg:gap-8 py-4 md:py-8
    xl:pl-4 w-full z-10;
}
</style>
