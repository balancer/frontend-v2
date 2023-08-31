<script setup lang="ts">
import { useLock } from '@/composables/useLock';

import { bnum } from '@/lib/utils';
import { useTokens } from '@/providers/tokens.provider';
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
import { useHistoricalLocksQuery } from '@/composables/queries/useHistoricalLocksQuery';
import { useLockRankQuery } from '@/composables/queries/useLockRankQuery';

/**
 * COMPOSABLES
 */
const { account } = useWeb3();

const { isLoadingLockPool, isLoadingLockInfo, lockPool, lock } = useLock();
const { balanceFor } = useTokens();
const { fNum } = useNumbers();
const router = useRouter();

const { veBalBalance } = useVeBal();
const { t } = useI18n();
const { isLoading, data } = useHistoricalLocksQuery(account);
const { isLoading: isLoadingLockBoard, data: userRankData } =
  useLockRankQuery(account);

/**
 * COMPUTED
 */
const isLoadingData = computed(
  () =>
    isLoadingLockBoard.value ||
    isLoading.value ||
    isLoadingLockInfo.value ||
    isLoadingLockPool.value
);

const bptBalance = computed(() => {
  if (!lockPool.value) return '';
  return balanceFor(lockPool.value.address);
});

const lockedUntil = computed(() => {
  if (lock.value?.hasExistingLock && !lock.value.isExpired) {
    return format(lock.value.lockedEndDate, PRETTY_DATE_FORMAT);
  }

  return '—';
});

const chartValues = computed(() => {
  if (!data.value) return [];

  const { lockSnapshots } = data.value;

  const currentDate = (Date.now() / 1000).toFixed(0);

  const chartV = lockSnapshots.reduce((acc: any, snapshot, i) => {
    const bias = bnum(snapshot.bias);
    const slope = bnum(snapshot.slope);
    const now = lockSnapshots[i + 1]
      ? bnum(lockSnapshots[i + 1].timestamp)
      : bnum(currentDate);

    const timestamp = snapshot.timestamp;

    const point1Balance = bias;

    const point2V = bias.minus(slope.times(now.minus(timestamp)));
    const point2Balance = point2V.isLessThan(0) ? bnum(0) : point2V;

    acc.push(
      Object.freeze<[string, number]>([
        format(snapshot.timestamp * 1000, 'yyyy/MM/dd'),
        point1Balance.toNumber(),
      ])
    );
    acc.push(
      Object.freeze<[string, number]>([
        format(now.toNumber() * 1000, 'yyyy/MM/dd'),
        point2Balance.toNumber(),
      ])
    );
    return acc;
  }, []);

  return chartV;
});

const userRank = computed(() => {
  if (!userRankData.value) return '';
  return userRankData.value.veBalGetUser.rank;
});

const vebalInfo = computed(() => {
  const arr: { icon: any; value: string }[] = [];

  if (bnum(veBalBalance.value).isGreaterThan(0)) {
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

  if (userRank.value) {
    arr.unshift({
      icon: rank,
      value: `Rank ${userRank.value}`,
    });
  }

  if (lock.value?.hasExistingLock) {
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
  if (lock.value?.hasExistingLock) {
    return {
      name: 'Future Lock',
      values: [
        chartValues.value[chartValues.value.length - 1],
        Object.freeze<[string, number]>([
          format(new Date(lockedUntil.value).getTime(), 'yyyy/MM/dd'),
          0,
        ]),
      ],
    };
  }
  return {};
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
  <div
    class="flex flex-col md:flex-row flex-grow gap-6 justify-between items-center px-10 h-full text-white"
  >
    <BalLoadingBlock v-if="isLoadingData" darker class="w-full h-full" />
    <div v-else class="flex flex-col flex-1">
      <div class="mb-2 text-xl font-bold">My veBAL</div>
      <div class="mb-10 text-5xl font-black">
        {{ fNum(bptBalance, FNumFormats.token) }}
      </div>

      <div class="flex flex-col mb-8">
        <div v-for="item in vebalInfo" :key="item.value" class="flex">
          <img class="mr-2" :src="item.icon" />
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
      v-else-if="lock?.hasExistingLock"
      class="p-5 w-full rounded-2xl flex-[1.5] chart-wrapper"
    >
      <BalChart
        :isLoading="isLoadingData"
        height="96"
        :data="chartData.data"
        :axisLabelFormatter="{
          yAxis: {
            maximumFractionDigits: 0,
            fixedFormat: true,
            abbreviate: true,
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
        showTooltip
        hideYAxis
        :customGrid="{
          left: '2.5%',
          right: '0',
          top: '10%',
          bottom: '15%',
          containLabel: false,
        }"
      />
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
  color: rgba(188, 162, 93, 1);
  border: 1px solid rgba(188, 162, 93, 1);
}

.chart-wrapper {
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: drop-shadow(40px 40px 80px rgba(0, 0, 0, 0.5));
}
</style>