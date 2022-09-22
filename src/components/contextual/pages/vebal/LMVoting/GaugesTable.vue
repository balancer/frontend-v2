<script setup lang="ts">
import { Network } from '@balancer-labs/sdk';
import BigNumber from 'bignumber.js';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import BalChipNew from '@/components/chips/BalChipNew.vue';
import BalChipExpired from '@/components/chips/BalChipExpired.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { networkNameFor } from '@/composables/useNetwork';
import useNumbers from '@/composables/useNumbers';
import {
  isStableLike,
  isUnknownType,
  orderedPoolTokens,
  poolURLFor,
} from '@/composables/usePool';
import { isSameAddress } from '@/lib/utils';
import { scale } from '@/lib/utils';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import useWeb3 from '@/services/web3/useWeb3';

import GaugesTableVoteBtn from './GaugesTableVoteBtn.vue';
import GaugeVoteInfo from './GaugeVoteInfo.vue';
import IconLimit from '@/components/icons/IconLimit.vue';
import {
  isVotingTimeLocked,
  remainingVoteLockTime,
} from '@/composables/useVeBAL';
import { Pool } from '@/services/pool/types';
import { differenceInWeeks } from 'date-fns';
import { oneSecondInMs } from '@/composables/useTime';

/**
 * TYPES
 */
type Props = {
  expiredGauges?: string[];
  data?: VotingGaugeWithVotes[];
  isLoading?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  expiredGauges: () => [],
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  isPaginated: false,
  data: () => [],
});

const emit = defineEmits<{
  (e: 'clickedVote', value: VotingGaugeWithVotes): void;
}>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { upToLargeBreakpoint } = useBreakpoints();
const { isWalletReady } = useWeb3();

/**
 * DATA
 */
const columns = ref<ColumnDefinition<VotingGaugeWithVotes>[]>([
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
    sortKey: gauge => Number(gauge.votesNextPeriod),
    width: 160,
    cellClassName: 'font-numeric',
  },
  {
    name: t('veBAL.liquidityMining.table.myVotes'),
    accessor: 'myVotes',
    align: 'right',
    id: 'myVotes',
    sortKey: gauge => Number(gauge.userVotes),
    width: 100,
    Cell: 'myVotesCell',
    cellClassName: 'font-numeric',
    hidden: !isWalletReady.value,
  },
  {
    name: t('veBAL.liquidityMining.table.vote'),
    id: 'vote',
    accessor: 'id',
    align: 'right',
    Cell: 'voteColumnCell',
    width: 100,
    hidden: !isWalletReady.value,
  },
]);

const dataKey = computed(() => JSON.stringify(props.data));

/**
 * METHODS
 */
function orderedTokenURIs(gauge: VotingGaugeWithVotes): string[] {
  const sortedTokens = orderedPoolTokens(gauge.pool as Pool, gauge.pool.tokens);
  return sortedTokens.map(
    token => gauge.tokenLogoURIs[token?.address || ''] || ''
  );
}

function networkSrc(network: Network) {
  return require(`@/assets/images/icons/networks/${networkNameFor(
    network
  )}.svg`);
}

function redirectToPool(gauge: VotingGaugeWithVotes) {
  window.location.href = poolURLFor(
    gauge.pool.id,
    gauge.network,
    gauge.pool.poolType
  );
}

function getIsGaugeNew(addedTimestamp: number): boolean {
  return differenceInWeeks(Date.now(), addedTimestamp * oneSecondInMs) < 2;
}

function getIsGaugeExpired(gaugeAddress: string): boolean {
  return !!props.expiredGauges.some(item => isSameAddress(gaugeAddress, item));
}

function getHasUserVotes(userVotes: string): boolean {
  return !!Number(userVotes);
}

function getTableRowClass(gauge: VotingGaugeWithVotes): string {
  return getHasUserVotes(gauge.userVotes) && getIsGaugeExpired(gauge.address)
    ? 'expired-gauge-row'
    : '';
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
      :key="dataKey"
      :columns="columns"
      :data="data"
      :isLoading="isLoading"
      skeletonClass="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :isPaginated="isPaginated"
      :onRowClick="redirectToPool"
      :getTableRowClass="getTableRowClass"
      :initialState="{
        sortColumn: 'nextPeriodVotes',
        sortDirection: 'desc',
      }"
      :pin="{
        pinOn: 'address',
        pinnedData: ['0xE867AD0a48e8f815DC0cda2CDb275e0F163A480b'],
      }"
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
            <img :src="networkSrc(network)" :alt="network" class="w-6 h-6" />
          </div>
        </div>
      </template>
      <template #iconColumnHeader>
        <div class="flex items-center">
          <CompositionIcon />
        </div>
      </template>
      <template #iconColumnCell="gauge">
        <div v-if="!isLoading" class="py-4 px-6">
          <BalAssetSet :logoURIs="orderedTokenURIs(gauge)" :width="100" />
        </div>
      </template>
      <template #poolCompositionCell="{ pool, address, addedTimestamp }">
        <div v-if="!isLoading" class="flex items-center py-4 px-6">
          <TokenPills
            :tokens="orderedPoolTokens(pool, pool.tokens)"
            :isStablePool="
              isStableLike(pool.poolType) || isUnknownType(pool.poolType)
            "
          />
          <BalChipNew v-if="getIsGaugeNew(addedTimestamp)" class="ml-2" />
          <BalChipExpired v-if="getIsGaugeExpired(address)" class="ml-2" />
        </div>
      </template>
      <template #nextPeriodVotesCell="gauge">
        <div v-if="!isLoading" class="flex justify-end py-4 px-6">
          <GaugeVoteInfo :gauge="gauge" />
          <div class="flex justify-end w-6">
            <IconLimit
              v-if="gauge.pool.symbol === 'veBAL'"
              size="sm"
              amount="10"
              :tooltip="
                $t(
                  'veBAL.liquidityMining.limitsTooltip.distributionsCappedVeBAL'
                )
              "
            />
            <IconLimit
              v-else-if="gauge.relativeWeightCap !== 'null'"
              size="sm"
              :amount="(Number(gauge.relativeWeightCap) * 100).toFixed()"
              :tooltip="
                $t(
                  'veBAL.liquidityMining.limitsTooltip.distributionsCappedAt',
                  [(Number(gauge.relativeWeightCap) * 100).toFixed()]
                )
              "
            />
          </div>
        </div>
      </template>
      <template #myVotesCell="gauge">
        <div class="flex justify-end px-4">
          {{
            fNum2(scale(new BigNumber(gauge.userVotes), -4).toString(), {
              style: 'percent',
              maximumFractionDigits: 2,
            })
          }}
          <div class="flex justify-end w-6">
            <BalTooltip v-if="isVotingTimeLocked(gauge.lastUserVoteTime)">
              <template #activator>
                <TimelockIcon />
              </template>
              <div>
                <span class="font-semibold">
                  {{
                    $t(
                      'veBAL.liquidityMining.popover.warnings.votedTooRecently.title'
                    )
                  }}
                </span>
                <p class="text-gray-500">
                  {{
                    $t(
                      'veBAL.liquidityMining.popover.warnings.votedTooRecently.description',
                      [remainingVoteLockTime(gauge.lastUserVoteTime)]
                    )
                  }}
                </p>
              </div>
            </BalTooltip>
          </div>
        </div>
      </template>
      <template #voteColumnCell="gauge">
        <div v-if="isWalletReady" class="px-4">
          <GaugesTableVoteBtn
            :hasUserVotes="getHasUserVotes(gauge.userVotes)"
            :isGaugeExpired="getIsGaugeExpired(gauge.address)"
            @click.stop="emit('clickedVote', gauge)"
          />
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>

<style>
tr.expired-gauge-row {
  @apply bg-red-50  hover:bg-red-100 dark:border-red-600 dark:border;
}
</style>
