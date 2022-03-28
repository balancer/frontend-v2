<script lang="ts" setup>
/**
 * Claim Page
 */
import { computed, watch } from 'vue';
import { configService } from '@/services/config/config.service';
import { Gauge } from '@/services/balancer/gauges/types';
import useTokens from '@/composables/useTokens';
import { formatUnits } from 'ethers/lib/utils';
import useNumbers from '@/composables/useNumbers';
import { getAddress } from '@ethersproject/address';
import { isStableLike } from '@/composables/usePool';
import { useTokenHelpers } from '@/composables/useTokenHelpers';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import { GaugePool, useClaimsData } from '@/composables/useClaimsData';

import { RewardRow } from '@/components/tables/BalClaimsTable/BalClaimsTable.vue';
import BalClaimsTable from '@/components/tables/BalClaimsTable/BalClaimsTable.vue';
import LegacyClaims from '@/components/contextual/pages/claim/LegacyClaims.vue';
import GaugeRewardsTable from '@/components/tables/GaugeRewardsTable/GaugeRewardsTable.vue';
import { isKovan, isL2, isMainnet } from '@/composables/useNetwork';

/**
 * TYPES
 */
type GaugeTable = {
  gauge: Gauge;
  pool: GaugePool;
};

/**
 * COMPOSABLES
 */
const { injectTokens, getToken } = useTokens();
const { balToken } = useTokenHelpers();
const { toFiat, fNum2 } = useNumbers();
const { isWalletReady } = useWeb3();
const { appLoading } = useApp();
const { gauges, gaugePools, queriesLoading } = useClaimsData();

/**
 * STATE
 */
const networks = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    subdomain: 'app',
    key: '1'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    subdomain: 'polygon',
    key: '137'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    subdomain: 'arbitrum',
    key: '42161'
  }
];

/**
 * COMPUTED
 */
const networkBtns = computed(() => {
  return networks.filter(network => network.key !== configService.network.key);
});

const supportsContractBasedClaiming = computed(
  (): boolean => isMainnet.value || isKovan.value
);

const balRewardsData = computed((): RewardRow[] => {
  if (!isWalletReady.value || appLoading.value) return [];
  // Using reduce to filter out gauges we don't have corresponding pools for
  return gauges.value.reduce<RewardRow[]>((arr, gauge) => {
    const amount = formatUnits(gauge.claimableTokens, balToken.value.decimals);
    const pool = gaugePools.value.find(pool => pool.id === gauge.poolId);

    if (pool && bnum(amount).gt(0))
      arr.push({
        gauge,
        pool,
        amount,
        value: toFiat(amount, balToken.value.address)
      });

    return arr;
  }, []);
});

const gaugesWithRewards = computed((): Gauge[] => {
  return gauges.value.filter(gauge => gauge.rewardTokens.length > 0);
});

const gaugeTables = computed((): GaugeTable[] => {
  return gaugesWithRewards.value.reduce<GaugeTable[]>((arr, gauge) => {
    const pool = gaugePools.value.find(pool => pool.id === gauge.poolId);

    if (pool)
      arr.push({
        gauge,
        pool
      });

    return arr;
  }, []);
});

/**
 * METHODS
 */
async function injectRewardTokens(gauges: Gauge[]): Promise<void> {
  const allRewardTokens = gauges.map(gauge => gauge.rewardTokens).flat();
  return await injectTokens(allRewardTokens);
}

async function injectPoolTokens(pools: GaugePool[]): Promise<void> {
  const allPoolTokens = pools.map(pools => pools.tokensList).flat();
  return await injectTokens(allPoolTokens);
}

function gaugeTitle(pool: GaugePool): string {
  const _tokens = pool.tokens.map(token => ({
    ...token,
    ...getToken(getAddress(token.address))
  }));

  if (isStableLike(pool.poolType)) {
    return Object.values(_tokens)
      .map(token => token.symbol)
      .join(' / ');
  }

  return Object.values(_tokens)
    .map(
      token =>
        `${fNum2(token.weight, {
          style: 'percent',
          maximumFractionDigits: 0
        })} ${token.symbol}`
    )
    .join(' / ');
}

/**
 * WATCHERS
 */
watch(gauges, async newGauges => {
  if (newGauges) await injectRewardTokens(newGauges);
});

watch(gaugePools, async newPools => {
  if (newPools) await injectPoolTokens(newPools);
});
</script>

<template>
  <div class="px-2 lg:px-0">
    <div class="lg:container lg:mx-auto py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 class="mb-4">
            {{ $t('pages.claim.title') }}
          </h1>
          <p>
            {{ $t('pages.claim.description') }}
          </p>
        </div>
        <div class="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
          <h3 class="mb-3">{{ $t('pages.claim.transitionInfo.title') }}</h3>
          <p>
            {{
              isL2
                ? $t('pages.claim.transitionInfo.descriptionL2')
                : $t('pages.claim.transitionInfo.description')
            }}
          </p>
        </div>
      </div>
    </div>
    <div class="lg:container lg:mx-auto py-12">
      <template v-if="supportsContractBasedClaiming">
        <h2 class="font-body font-bold text-2xl">
          {{ configService.network.chainName }} {{ $t('liquidityIncentives') }}
        </h2>

        <BalLoadingBlock v-if="appLoading" class="mt-6 mb-2 h-8 w-64" />
        <div v-else class="flex items-center mt-6 mb-2">
          <BalAsset :address="balToken?.address" />
          <h3 class="text-xl ml-2">
            Balancer (BAL) {{ $t('earnings').toLowerCase() }}
          </h3>
        </div>
        <BalClaimsTable
          :rewardsData="balRewardsData"
          :isLoading="queriesLoading || appLoading"
        />

        <template
          v-if="!queriesLoading && !appLoading && gaugesWithRewards.length > 0"
        >
          <h3 class="text-xl mt-8">{{ $t('otherTokenEarnings') }}</h3>
          <div v-for="{ gauge, pool } in gaugeTables" :key="gauge.id">
            <div class="flex mt-4">
              <h4 class="text-base mb-2">
                {{ gaugeTitle(pool) }}
              </h4>
            </div>
            <GaugeRewardsTable
              :gauge="gauge"
              :isLoading="queriesLoading || appLoading"
            />
          </div>
        </template>

        <h2 class="font-body font-bold text-2xl mt-8">
          {{ $t('pages.claim.titles.incentivesOnOtherNetworks') }}
        </h2>
        <BalFlexGrid class="mt-4" flexWrap>
          <BalBtn
            tag="a"
            v-for="network in networkBtns"
            :key="network.id"
            :href="`https://${network.subdomain}.balancer.fi/#/claim`"
            color="white"
          >
            <img
              :src="require(`@/assets/images/icons/networks/${network.id}.svg`)"
              :alt="network.id"
              class="w-6 h-6 rounded-full shadow-sm mr-2"
            />
            {{ $t('pages.claim.btns.claimOn') }} {{ network.name }}
          </BalBtn>
        </BalFlexGrid>
      </template>

      <template v-if="isWalletReady">
        <h2
          :class="[
            'font-body font-bold text-2xl',
            { 'mt-8': supportsContractBasedClaiming }
          ]"
        >
          {{
            !supportsContractBasedClaiming
              ? `${configService.network.chainName} ${$t(
                  'liquidityIncentives'
                )}`
              : $t('pages.claim.titles.legacyIncentives')
          }}
        </h2>
        <LegacyClaims />
      </template>
    </div>
  </div>
</template>
