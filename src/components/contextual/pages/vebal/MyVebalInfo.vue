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

/**
 * COMPOSABLES
 */
const { isWalletReady } = useWeb3();

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

const vebalInfo = computed(() => {
  return [
    {
      icon: rank,
      value: `Rank ${123}?`,
    },
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
});

const chartData = computed(() => {
  return {
    color: [tailwind.theme.colors.blue['600']],
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
        values: [
          ['2023/08/20', 0],
          ['2023/08/19', 248881.57970237732],
          ['2023/08/18', 119952.75749278069],
          ['2023/08/17', 411067.2403087616],
          ['2023/08/16', 291478.2042810917],
          ['2023/08/15', 997422.4699790478],
          ['2023/08/14', 48426.61977338791],
          ['2023/08/13', 249290.96477770805],
          ['2023/08/12', 93680.32570385933],
          ['2023/08/11', 38157.74138402939],
          ['2023/08/10', 364529.0811743736],
          ['2023/08/09', 222431.92402267456],
          ['2023/08/08', 555043.8824164867],
          ['2023/08/07', 732600.8050308228],
          ['2023/08/06', 210462.38756251335],
          ['2023/08/05', 132322.47475481033],
          ['2023/08/04', 248568.95622563362],
          ['2023/08/03', 112771.10418915749],
          ['2023/08/02', 443235.3097040653],
          ['2023/08/01', 437580.36851119995],
          ['2023/07/31', 208963.35039281845],
          ['2023/07/30', 135667.58742928505],
          ['2023/07/29', 346206.23892378807],
          ['2023/07/28', 276910.1362462044],
          ['2023/07/27', 160947.55203938484],
          ['2023/07/26', 103045.69572925568],
          ['2023/07/25', 217754.9986720085],
          ['2023/07/24', 1487870.859509468],
          ['2023/07/23', 86010.28455734253],
          ['2023/07/22', 300411.0140891075],
          ['2023/07/21', 327124.8192822933],
          ['2023/07/20', 105038.57004570961],
          ['2023/07/19', 79380.907995224],
          ['2023/07/18', 638724.4200615883],
          ['2023/07/17', 931317.5420634747],
          ['2023/07/16', 183597.32418370247],
          ['2023/07/15', 175162.22455310822],
          ['2023/07/14', 671035.8280260563],
          ['2023/07/13', 182160.9765534401],
          ['2023/07/12', 182896.33430743217],
          ['2023/07/11', 144448.94937968254],
          ['2023/07/10', 162698.0696001053],
          ['2023/07/09', 81886.64416408539],
          ['2023/07/08', 80832.21500277519],
          ['2023/07/07', 67432.47193670273],
          ['2023/07/06', 279450.5515511036],
          ['2023/07/05', 234750.9247689247],
          ['2023/07/04', 548335.0576088428],
          ['2023/07/03', 328449.18671774864],
          ['2023/07/02', 167616.99867773056],
          ['2023/07/01', 78818.14094901085],
          ['2023/06/30', 678025.927210331],
          ['2023/06/29', 40364.94275188446],
          ['2023/06/28', 182748.69951152802],
          ['2023/06/27', 94714.93087291718],
          ['2023/06/26', 1061248.4683372974],
          ['2023/06/25', 1334131.415075779],
          ['2023/06/24', 96082.4197177887],
          ['2023/06/23', 59631.891404390335],
          ['2023/06/22', 85097.26462483406],
          ['2023/06/21', 385025.35928559303],
          ['2023/06/20', 473987.321372509],
          ['2023/06/19', 37313.63886022568],
          ['2023/06/18', 68383.62207388878],
          ['2023/06/17', 70231.80819559097],
          ['2023/06/16', 111741.50665903091],
          ['2023/06/15', 532314.0859575272],
          ['2023/06/14', 265433.39269185066],
          ['2023/06/13', 150955.96111798286],
          ['2023/06/12', 211546.5414686203],
          ['2023/06/11', 384950.87112379074],
          ['2023/06/10', 1936087.655068636],
          ['2023/06/09', 161904.63433861732],
          ['2023/06/08', 166092.79978394508],
          ['2023/06/07', 515370.17323732376],
          ['2023/06/06', 129399.5275876522],
          ['2023/06/05', 366110.9878475666],
          ['2023/06/04', 19469.43434405327],
          ['2023/06/03', 101942.90708136559],
          ['2023/06/02', 106943.78475284576],
          ['2023/06/01', 59370.608226537704],
          ['2023/05/31', 131055.56418395042],
          ['2023/05/30', 289686.04125118256],
          ['2023/05/29', 505766.9463636875],
          ['2023/05/28', 141154.38839960098],
          ['2023/05/27', 77625.25688958168],
          ['2023/05/26', 52115.876940488815],
          ['2023/05/25', 647439.7320814133],
          ['2023/05/24', 307314.696931839],
        ],
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
  <div class="flex items-center px-10 text-white">
    <div>
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
      v-if="isLoadingLockInfo || isLoadingLockPool"
      class="height[30.9rem]"
    />

    <BalChart
      v-else
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
      needChartValue
      :chartType="chartData.chartType"
      :showTooltipLayer="false"
    />
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
</style>