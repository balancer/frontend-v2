<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import BalChipNew from '@/components/chips/BalChipNew.vue';
import BalChipExpired from '@/components/chips/BalChipExpired.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { getNetworkSlug } from '@/composables/useNetwork';
import {
  isGyro,
  isStableLike,
  isUnknownType,
  isVeBalPool,
  poolURLFor,
} from '@/composables/usePoolHelpers';
import { VotingPool } from '@/composables/queries/useVotingPoolsQuery';
import useWeb3 from '@/services/web3/useWeb3';

import GaugeVoteInfo from './GaugeVoteInfo.vue';
import GaugesTableMyVotes from './GaugesTableMyVotes.vue';
import BalAssetSet from '@/components/_global/BalAsset/BalAssetSet.vue';
import {
  orderedTokenURIs,
  orderedGaugeTokens,
  isVe8020Pool,
} from '@/composables/useVotingPools';
import IconLimit from '@/components/icons/IconLimit.vue';
import { buildNetworkIconURL } from '@/lib/utils/urls';
import { poolMetadata } from '@/lib/config/metadata';
import Ve8020Chip from './Ve8020Chip.vue';
import PoolFeatureChip from '@/components/chips/PoolFeatureChip.vue';
import { PoolFeature } from '@/types/pools';
import { Protocol } from '@/composables/useProtocols';
import { isVotingTimeLocked } from '@/composables/useVeBAL';
import { useVoting } from '@/components/contextual/pages/vebal/providers/voting.provider';
import {
  hasUserVotes,
  isGaugeNew,
} from '@/components/contextual/pages/vebal/voting-utils';

/**
 * TYPES
 */
type Props = {
  data?: VotingPool[];
  isLoading?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  filterText?: string;
  renderedRowsIdx: number;
  selectVotesDisabled: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  filterText: '',
  isPaginated: false,
  data: () => [],
});

/**
 * COMPOSABLES
 */
const router = useRouter();
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { isWalletReady } = useWeb3();
const { getIsGaugeExpired, toggleSelection, isSelected } = useVoting();

/**
 * DATA
 */
const columns = computed((): ColumnDefinition<VotingPool>[] => [
  {
    name: t('veBAL.liquidityMining.table.chain'),
    id: 'chain',
    accessor: '',
    Header: 'chainColumnHeader',
    Cell: 'networkColumnCell',
    width: 50,
    noGrow: true,
  },
  {
    name: t('veBAL.liquidityMining.table.assets'),
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 100,
    noGrow: true,
  },
  {
    name: t('veBAL.liquidityMining.table.composition'),
    id: 'poolComposition',
    accessor: 'id',
    Cell: 'poolCompositionCell',
    width: 350,
  },
  {
    name: t('veBAL.liquidityMining.table.nextPeriodVotes'),
    accessor: 'id',
    align: 'right',
    id: 'nextPeriodVotes',
    Cell: 'nextPeriodVotesCell',
    sortKey: pool => Number(pool.votesNextPeriod),
    width: 160,
    cellClassName: 'font-numeric',
  },
  {
    name: t('veBAL.liquidityMining.table.myVotes'),
    accessor: 'myVotes',
    align: 'right',
    id: 'myVotes',
    sortKey: pool => Number(pool.userVotes),
    width: 100,
    Cell: 'myVotesCell',
    cellClassName: 'font-numeric',
    hidden: !isWalletReady.value,
  },
  {
    name: t('veBAL.liquidityMining.table.voteSelect'),
    id: 'vote',
    accessor: 'id',
    align: 'right',
    Cell: 'voteSelectColumnCell',
    sortKey: pool => isSelected(pool),
    width: 100,
    hidden: !isWalletReady.value,
    isCheckbox: true,
  },
]);

/**
 * METHODS
 */
function isInternalUrl(url: string): boolean {
  return url.includes('balancer.fi') || url.includes('localhost');
}

function redirectToPool(pool: VotingPool, inNewTab) {
  const redirectUrl = poolURLFor(pool, pool.network);
  if (!isInternalUrl(redirectUrl)) {
    window.location.href = redirectUrl;
  } else {
    const route = router.resolve({
      name: 'pool',
      params: { id: pool.id, networkSlug: getNetworkSlug(pool.network) },
    });
    inNewTab ? window.open(route.href) : router.push(route);
  }
}

function getPoolExternalUrl(pool: VotingPool) {
  const poolUrl = poolURLFor(pool, pool.network);
  return isInternalUrl(poolUrl) ? null : poolUrl;
}

function getHasUserVotes(userVotes: string): boolean {
  return !!Number(userVotes);
}

function getTableRowClass(pool: VotingPool): string {
  return getHasUserVotes(pool.userVotes) &&
    getIsGaugeExpired(pool.gauge.address)
    ? 'expired-gauge-row'
    : '';
}

function getSelectedTokens(tokens: VotingPool['tokens']) {
  return tokens
    .filter(
      token => token.symbol?.toLowerCase() === props.filterText?.toLowerCase()
    )
    .map(item => item.address);
}

function getPickedTokens(tokens: VotingPool['tokens']) {
  return tokens
    .filter(
      token =>
        props.filterText &&
        token.symbol?.toLowerCase().includes(props.filterText?.toLowerCase())
    )
    .map(item => item.address);
}

function voteDisabledFor(pool: VotingPool): boolean {
  return (
    hasUserVotes(pool) ||
    isVotingTimeLocked(pool.lastUserVoteTime) ||
    props.selectVotesDisabled
  );
}
</script>

<template>
  <BalCard
    shadow="lg"
    class="mt-4"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="data"
      :rowKey="(dataItem: VotingPool) => dataItem.gauge.address"
      :isLoading="isLoading"
      skeletonClass="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :isPaginated="isPaginated"
      :href="{ getHref: gauge => getPoolExternalUrl(gauge) }"
      :onRowClick="
        (pool, inNewTab) => !voteDisabledFor(pool) && toggleSelection(pool)
      "
      :getTableRowClass="getTableRowClass"
      :initialState="{
        sortColumn: 'nextPeriodVotes',
        sortDirection: 'desc',
      }"
      :pin="{
        pinOn: 'address',
        pinnedData: [],
      }"
      :renderedRowsIdx="renderedRowsIdx"
    >
      <template #chainColumnHeader>
        <div class="flex items-center">
          <NetworkIcon />
        </div>
      </template>
      <template #networkColumnCell="{ network }">
        <div v-if="!isLoading" class="py-4 px-6">
          <div
            class="flex justify-center items-center w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded shadow-sm"
          >
            <img
              :src="buildNetworkIconURL(getNetworkSlug(network))"
              :alt="network"
              class="w-6 h-6"
            />
          </div>
        </div>
      </template>
      <template #iconColumnHeader>
        <div class="flex items-center">
          <CompositionIcon />
        </div>
      </template>
      <template #iconColumnCell="pool: VotingPool">
        <div v-if="!isLoading" class="py-4 px-6">
          <BalAssetSet :logoURIs="orderedTokenURIs(pool)" :width="100" />
        </div>
      </template>
      <template #poolCompositionCell="pool: VotingPool">
        <div v-if="!isLoading" class="flex items-center py-4 px-6">
          <div v-if="poolMetadata(pool.id)?.name" class="text-left">
            {{ poolMetadata(pool.id)?.name }}
          </div>
          <TokenPills
            v-else
            :tokens="orderedGaugeTokens(pool)"
            :isStablePool="
              isStableLike(pool.poolType) || isUnknownType(pool.poolType)
            "
            :selectedTokens="getSelectedTokens(pool.tokens)"
            :pickedTokens="getPickedTokens(pool.tokens)"
          />
          <Ve8020Chip v-if="isVe8020Pool(pool)" />
          <BalTooltip v-if="isGyro(pool)" :text="$t('clpTooltip')" width="56">
            <template #activator>
              <PoolFeatureChip
                :feature="PoolFeature.CLP"
                :protocols="[Protocol.Gyro]"
                class="ml-1"
              />
            </template>
          </BalTooltip>
          <BalChipNew v-if="isGaugeNew(pool)" class="ml-2" />
          <BalChipExpired
            v-if="getIsGaugeExpired(pool.gauge.address)"
            class="ml-2"
          />
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-2 text-gray-500 hover:text-blue-500 transition-colors"
            @click="redirectToPool(pool, true)"
          />
        </div>
      </template>
      <template #nextPeriodVotesCell="pool: VotingPool">
        <!-- Put to BalLazy the most expensive to render component -->
        <BalLazy>
          <div v-if="!isLoading" class="flex justify-end py-4 px-6">
            <GaugeVoteInfo :pool="pool" />
            <div class="flex justify-end w-6">
              <IconLimit
                v-if="isVeBalPool(pool.id)"
                size="sm"
                amount="10"
                :tooltip="
                  $t(
                    'veBAL.liquidityMining.limitsTooltip.distributionsCappedVeBAL'
                  )
                "
              />
              <IconLimit
                v-else-if="
                  pool.gauge?.relativeWeightCap &&
                  Number(pool.gauge.relativeWeightCap) !== 1
                "
                size="sm"
                :amount="(Number(pool.gauge.relativeWeightCap) * 100).toFixed()"
                :tooltip="
                  $t(
                    'veBAL.liquidityMining.limitsTooltip.distributionsCappedAt',
                    [(Number(pool.gauge.relativeWeightCap) * 100).toFixed()]
                  )
                "
              />
            </div>
          </div>
        </BalLazy>
      </template>
      <template #myVotesCell="pool: VotingPool">
        <div v-if="!isLoading" class="py-4 px-6 text-right">
          <GaugesTableMyVotes :pool="pool"></GaugesTableMyVotes>
        </div>
      </template>
      <template #voteSelectColumnCell="pool: VotingPool">
        <BalCheckbox
          v-if="isWalletReady"
          class="flex -top-2 justify-center ml-8 cursor-pointer"
          name="expiredGaugesFilter"
          noMargin
          :modelValue="isSelected(pool)"
          :disabled="voteDisabledFor(pool)"
          @click.stop
          @input="toggleSelection(pool)"
        />
      </template>
    </BalTable>
  </BalCard>
</template>

<style>
tr.expired-gauge-row {
  @apply bg-red-50  hover:bg-red-100 dark:border-red-600 dark:border;
}
</style>
