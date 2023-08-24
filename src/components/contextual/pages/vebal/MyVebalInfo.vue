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
import useTailwind from '@/composables/useTailwind';
import * as echarts from 'echarts/core';
import useVeBal from '@/composables/useVeBAL';
import { useI18n } from 'vue-i18n';
import { useHistoricalLocksQuery } from '@/composables/queries/useHistoricalLocksQuery';
import { useLockLeaderQuery } from '@/composables/queries/useLockLeaderQuery';

/**
 * COMPOSABLES
 */
const { isWalletReady, account } = useWeb3();

const {
  isLoadingLockPool,
  isLoadingLockInfo,
  lockPool,
  lockPoolToken,
  lock,
  totalLockedValue,
} = useLock();
const { balanceFor } = useTokens();
const { fNum } = useNumbers();
const router = useRouter();
const tailwind = useTailwind();
const { veBalBalance, lockablePoolId } = useVeBal();
const { t } = useI18n();
const { isLoading, data } = useHistoricalLocksQuery(account);
const { isLoading: isLoadingLockBoard, data: lockBoardData } =
  useLockLeaderQuery();
/**
 * COMPUTED
 */
const poolShares = computed(() => {
  if (!lockPool.value) return bnum(0);
  return bnum(lockPool.value.totalLiquidity).div(lockPool.value.totalShares);
});

const bptBalance = computed(() => {
  if (!lockPool.value) return '';
  return balanceFor(lockPool.value.address);
});

const fiatTotal = computed(() =>
  poolShares.value.times(bptBalance.value).toString()
);

const lockedUntil = computed(() => {
  if (lock.value?.hasExistingLock && !lock.value.isExpired) {
    return format(lock.value.lockedEndDate, PRETTY_DATE_FORMAT);
  }

  return '—';
});

const chartValues = computed(() => {
  if (!data.value) return [];
  console.log(data.value);
  return data.value.lockSnapshots.map(snapshot => {
    // veBAL_balance = bias - slope * (now() - timestamp)
    const bias = bnum(snapshot.bias);
    const slope = bnum(snapshot.slope);
    const now = bnum(Date.now());
    // console.log({
    //   bias,
    //   slope,
    //   now: now.toNumber(),
    //   timestamp: snapshot.timestamp,
    // });
    const timestamp = snapshot.timestamp * 1000;
    // console.log({
    //   bias,
    //   slope,
    //   now: now.toNumber(),
    //   timestamp,
    // });
    const veBalBalance = bias.minus(slope.times(now.minus(timestamp)));
    // console.log(veBalBalance.toNumber());
    return Object.freeze<[string, number]>([
      format(snapshot.timestamp * 1000, 'yyyy/MM/dd'),
      veBalBalance.abs().toNumber(),
    ]);
  });
});

const userRank = computed(() => {
  if (!lockBoardData.value) return '';
  const rank = lockBoardData.value.votingEscrowLocks.findIndex(
    item => item.user.id.toLowerCase() === account.value?.toLowerCase()
  );
  return rank === -1 ? '' : rank + 1;
});

const vebalInfo = computed(() => {
  const arr = [
    {
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
    },
    {
      icon: hourglass,
      value: `Expires ${lockedUntil.value} (${differenceInDays(
        new Date(lockedUntil.value),
        new Date()
      )} days)`,
    },
  ];

  if (userRank.value) {
    arr.unshift({
      icon: rank,
      value: `Rank ${userRank.value}`,
    });
  }
  return arr;
});

const chartData = computed(() => {
  console.log('chartValues', chartValues.value);
  return {
    color: ['#BCA25D'],
    hoverBorderColor: tailwind.theme.colors.pink['500'],
    hoverColor: tailwind.theme.colors.white,
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
        name: 'TVL',
        values: chartValues.value,
      },
    ],
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
  <div class="flex flex-grow justify-between items-center px-10 text-white">
    <BalLoadingBlock
      v-if="isLoadingLockInfo || isLoadingLockPool"
      class="height[30.9rem]"
    />
    <div v-else class="flex flex-col flex-1 mr-10">
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
    <BalLoadingBlock
      v-if="isLoadingLockInfo || isLoadingLockPool || isLoading"
      class="height-[30.9rem]"
    />
    <div v-else class="p-5 w-full rounded-2xl flex-[2] chart-wrapper">
      <BalChart
        :isLoading="isLoadingLockInfo || isLoadingLockPool"
        height="96"
        :data="chartData.data"
        :axisLabelFormatter="{
          yAxis: {
            style: 'currency',
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
        :showTooltipLayer="false"
        showTooltip
        hideYAxis
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