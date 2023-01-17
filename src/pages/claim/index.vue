<script lang="ts" setup>
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { computed, onBeforeMount, watch } from 'vue';

import HeroClaim from '@/components/contextual/pages/claim/HeroClaim.vue';
import BalClaimsTable, {
  RewardRow,
} from '@/components/tables/BalClaimsTable.vue';
import GaugeRewardsTable from '@/components/tables/GaugeRewardsTable.vue';
import ProtocolRewardsTable, {
  ProtocolRewardRow,
} from '@/components/tables/ProtocolRewardsTable.vue';
import { GaugePool, useClaimsData } from '@/composables/useClaimsData';
import { isL2, isMainnet } from '@/composables/useNetwork';
import useNumbers from '@/composables/useNumbers';
import { isStableLike } from '@/composables/usePool';
import { useTokenHelpers } from '@/composables/useTokenHelpers';
import { useTokens } from '@/providers/tokens.provider';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import { bbAUSDToken } from '@/services/balancer/contracts/contracts/bb-a-usd-token';
import { Gauge } from '@/services/balancer/gauges/types';
import { configService } from '@/services/config/config.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import useWeb3 from '@/services/web3/useWeb3';
import { TOKENS } from '@/constants/tokens';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { Network } from '@balancer-labs/sdk';

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
const { injectTokens, injectPrices, getToken } = useTokens();
const { balToken } = useTokenHelpers();
const { toFiat, fNum2 } = useNumbers();
const { isWalletReady } = useWeb3();
const {
  gauges,
  gaugePools,
  protocolRewards,
  isLoading: isClaimsLoading,
} = useClaimsData();

/**
 * STATE
 */
interface NetworkMetadata {
  id: string;
  name: string;
  key: Network;
}

const networks: NetworkMetadata[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    key: Network.MAINNET,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    key: Network.POLYGON,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    key: Network.ARBITRUM,
  },
];

/**
 * COMPUTED
 */
const loading = computed(
  (): boolean => isClaimsLoading.value && isWalletReady.value
);

const networkBtns = computed(() => {
  return networks.filter(
    network => network.key.toString() !== configService.network.key
  );
});

const balRewardsData = computed((): RewardRow[] => {
  if (!isWalletReady.value) return [];
  // Using reduce to filter out gauges we don't have corresponding pools for
  return gauges.value.reduce<RewardRow[]>((arr, gauge) => {
    const amount = formatUnits(gauge.claimableTokens, balToken.value.decimals);
    const pool = gaugePools.value.find(pool => pool.id === gauge.poolId);

    if (pool && bnum(amount).gt(0))
      arr.push({
        gauge,
        pool,
        amount,
        value: toFiat(amount, balToken.value.address),
      });

    return arr;
  }, []);
});

const protocolRewardsData = computed((): ProtocolRewardRow[] => {
  return formatRewardsData(protocolRewards.value.v2);
});

/**
 * The feeDistributor contract was updated and so we need to support the old
 * one so that users can claim their rewards. Eventually we should be able to
 * remove this.
 */
const protocolRewardsDataDeprecated = computed((): ProtocolRewardRow[] => {
  return formatRewardsData(protocolRewards.value.v1);
});

const gaugesWithRewards = computed((): Gauge[] => {
  return gauges.value.filter(gauge => gauge.rewardTokens.length > 0);
});

const gaugeTables = computed((): GaugeTable[] => {
  // Only return gauges if we have a corresponding pool and rewards > 0
  return gaugesWithRewards.value.reduce<GaugeTable[]>((arr, gauge) => {
    const pool = gaugePools.value.find(pool => pool.id === gauge.poolId);
    const totalRewardValue = Object.values(gauge.claimableRewards).reduce(
      (acc, reward) => acc.plus(reward),
      bnum(0)
    );

    if (pool && totalRewardValue.gt(0))
      arr.push({
        gauge,
        pool,
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
    ...getToken(getAddress(token.address)),
  }));

  if (isStableLike(pool.poolType)) {
    return Object.values(_tokens)
      .map(token => token.symbol)
      .join(' / ');
  }

  return Object.values(_tokens)
    .map(
      token =>
        `${fNum2(token.weight || '0', {
          style: 'percent',
          maximumFractionDigits: 0,
        })} ${token.symbol}`
    )
    .join(' / ');
}

function formatRewardsData(data?: BalanceMap): ProtocolRewardRow[] {
  if (!isWalletReady.value || !data) return [];

  return Object.keys(data).map(tokenAddress => {
    const token = getToken(tokenAddress);
    const amount = formatUnits(data[tokenAddress], token.decimals);

    return {
      token,
      amount,
      value: toFiat(amount, tokenAddress),
    };
  });
}

/**
 * @summary Fetches bb-a-USD rate as an appoximation of USD price.
 */
async function getBBaUSDPrice() {
  if (isMainnet.value) {
    const appoxPrice = bnum(await bbAUSDToken.getRate()).toNumber();
    injectPrices({
      [TOKENS.Addresses.bbaUSD as string]: { [FiatCurrency.usd]: appoxPrice },
      [TOKENS.Addresses.bbaUSDv2 as string]: { [FiatCurrency.usd]: appoxPrice },
    });
  }
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

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  if (!isL2.value) await getBBaUSDPrice();
});
</script>

<template>
  <div>
    <HeroClaim
      :title="$t('claimHero.title')"
      :description="$t('claimHero.description')"
    />
    <div>
      <div class="xl:container py-12 xl:px-4 xl:mx-auto">
        <h2 class="px-4 xl:px-0 font-body text-2xl font-semibold">
          {{ configService.network.chainName }} {{ $t('liquidityIncentives') }}
        </h2>

        <template v-if="!isL2">
          <div class="mb-16">
            <div class="px-4 xl:px-0">
              <div class="flex items-center mt-6 mb-2">
                <h3 class="inline-block mr-1.5 text-xl">
                  BAL {{ $t('incentives') }}
                </h3>
                <BalTooltip
                  iconSize="xs"
                  textAlign="left"
                  class="relative top-px"
                  iconClass="text-secondary"
                  width="60"
                >
                  {{ $t('claimPage.tips.BalIncentives') }}
                </BalTooltip>
              </div>
            </div>
            <BalClaimsTable
              :rewardsData="balRewardsData"
              :isLoading="loading"
            />
          </div>
          <div class="mb-16">
            <h3 class="inline-block xl:px-0 pl-4 mt-8 mr-1.5 mb-3 text-xl">
              {{ $t('protocolIncentives') }}
            </h3>
            <BalTooltip
              iconSize="xs"
              textAlign="left"
              class="relative top-px"
              iconClass="text-secondary"
              width="60"
            >
              {{ $t('claimPage.tips.ProtocolAndVebal') }}
            </BalTooltip>
            <ProtocolRewardsTable
              :rewardsData="protocolRewardsData"
              :isLoading="loading"
            />
            <ProtocolRewardsTable
              v-if="!loading"
              :rewardsData="protocolRewardsDataDeprecated"
              :isLoading="loading"
              deprecated
            />
          </div>
        </template>
        <div v-if="!isL2">
          <h3 class="inline-block px-4 xl:px-0 mt-8 mr-1.5 text-xl">
            {{ $t('otherTokenIncentives') }}
          </h3>
          <BalTooltip
            iconSize="xs"
            textAlign="left"
            class="relative top-px"
            iconClass="text-secondary"
            width="60"
          >
            {{ $t('claimPage.tips.OtherIncentives') }}
          </BalTooltip>
        </div>
        <BalLoadingBlock v-if="loading" class="mt-6 mb-2 h-56" />
        <template v-if="!isClaimsLoading && gaugeTables.length > 0">
          <div v-for="{ gauge, pool } in gaugeTables" :key="gauge.id">
            <div class="mb-16">
              <div class="flex px-4 xl:px-0 mt-4">
                <h4 class="mb-2 text-base">
                  {{ gaugeTitle(pool) }}
                </h4>
              </div>
              <GaugeRewardsTable :gauge="gauge" :isLoading="isClaimsLoading" />
            </div>
          </div>
        </template>

        <BalBlankSlate
          v-else-if="
            (!isClaimsLoading && gaugeTables.length === 0) || !isWalletReady
          "
          class="px-4 xl:px-0 mt-4 mb-16"
        >
          {{ $t('noClaimableIncentives') }}
        </BalBlankSlate>
        <div class="px-4 xl:px-0 mb-16">
          <h2 class="mt-8 font-body text-2xl font-semibold">
            {{ $t('pages.claim.titles.incentivesOnOtherNetworks') }}
          </h2>
          <BalFlexGrid class="mt-4" flexWrap>
            <BalBtn
              v-for="network in networkBtns"
              :key="network.id"
              tag="a"
              :href="`https://app.balancer.fi/#/${network.id}/claim`"
              color="white"
            >
              <img
                :src="buildNetworkIconURL(network.id as unknown as  Network)"
                :alt="network.id"
                class="mr-2 w-6 h-6 rounded-full shadow-sm"
              />
              {{ $t('pages.claim.btns.claimOn') }} {{ network.name }}
            </BalBtn>
          </BalFlexGrid>
          <BalLink
            v-if="isWalletReady"
            tag="router-link"
            to="/claim/legacy"
            class="flex items-center"
            >{{ $t('legacyClaims') }}
            <BalIcon name="arrow-right" size="sm" class="mx-1"
          /></BalLink>
        </div>
      </div>
    </div>
  </div>
</template>
