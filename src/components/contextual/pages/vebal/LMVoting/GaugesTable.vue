<script setup lang="ts">
import { Network } from '@balancer-labs/sdk';
import BigNumber from 'bignumber.js';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import useExpiredGaugesQuery from '@/composables/queries/useExpiredGaugesQuery';
import useBreakpoints from '@/composables/useBreakpoints';
import { networkNameFor } from '@/composables/useNetwork';
import useNumbers from '@/composables/useNumbers';
import {
  isStableLike,
  isUnknownType,
  orderedPoolTokens,
  poolURLFor
} from '@/composables/usePool';
import { isSameAddress } from '@/lib/utils';
import { scale } from '@/lib/utils';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import useWeb3 from '@/services/web3/useWeb3';

import GaugeVoteInfo from './GaugeVoteInfo.vue';

/**
 * TYPES
 */
type Props = {
  data?: VotingGaugeWithVotes[];
  isLoading?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  isPaginated: false
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
const { data: expiredGauges } = useExpiredGaugesQuery(
  props.data?.map(gauge => gauge.address)
);

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
    width: 80,
    noGrow: true
  },
  {
    name: t('veBAL.liquidityMining.table.assets'),
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 125,
    noGrow: true
  },
  {
    name: t('veBAL.liquidityMining.table.composition'),
    id: 'poolComposition',
    accessor: 'id',
    Cell: 'poolCompositionCell',
    width: 350
  },
  {
    name: t('veBAL.liquidityMining.table.nextPeriodVotes'),
    accessor: 'id',
    align: 'right',
    id: 'nextPeriodVotes',
    Cell: 'nextPeriodVotesCell',
    sortKey: gauge => Number(gauge.votesNextPeriod),
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('veBAL.liquidityMining.table.myVotes'),
    accessor(gauge) {
      const normalizedVotes = scale(new BigNumber(gauge.userVotes), -4);
      return fNum2(normalizedVotes.toString(), {
        style: 'percent',
        maximumFractionDigits: 2
      });
    },
    align: 'right',
    id: 'myVotes',
    sortKey: gauge => Number(gauge.userVotes),
    width: 150,
    cellClassName: 'font-numeric',
    hidden: !isWalletReady.value
  },
  {
    name: t('veBAL.liquidityMining.table.vote'),
    id: 'vote',
    accessor: 'id',
    align: 'right',
    Cell: 'voteColumnCell',
    width: 80,
    hidden: !isWalletReady.value
  }
]);

/**
 * METHODS
 */
function orderedTokenURIs(gauge: VotingGaugeWithVotes): string[] {
  const sortedTokens = orderedPoolTokens(
    gauge.pool.poolType,
    gauge.pool.address,
    gauge.pool.tokens
  );
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

function isGaugeExpired(gaugeAddress: string): boolean {
  return !!expiredGauges.value?.some(item => isSameAddress(gaugeAddress, item));
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
      :key="data"
      :columns="columns"
      :data="data"
      :is-loading="isLoading"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :is-paginated="isPaginated"
      :on-row-click="redirectToPool"
      :initial-state="{
        sortColumn: 'nextPeriodVotes',
        sortDirection: 'desc'
      }"
      :pin="{
        pinOn: 'address',
        pinnedData: ['0xE867AD0a48e8f815DC0cda2CDb275e0F163A480b']
      }"
    >
      <template v-slot:chainColumnHeader>
        <div class="flex items-center">
          <NetworkIcon />
        </div>
      </template>
      <template v-slot:networkColumnCell="{ network }">
        <div v-if="!isLoading" class="px-6 py-4">
          <div
            class="w-8 h-8 rounded shadow-sm bg-gray-50 dark:bg-gray-800 flex items-center justify-center"
          >
            <img :src="networkSrc(network)" :alt="network" class="w-6 h-6" />
          </div>
        </div>
      </template>
      <template v-slot:iconColumnHeader>
        <div class="flex items-center">
          <CompositionIcon />
        </div>
      </template>
      <template v-slot:iconColumnCell="gauge">
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSet :logoURIs="orderedTokenURIs(gauge)" :width="100" />
        </div>
      </template>
      <template v-slot:poolCompositionCell="{ pool, address }">
        <div v-if="!isLoading" class="px-6 py-4 flex items-center">
          <TokenPills
            :tokens="
              orderedPoolTokens(pool.poolType, pool.address, pool.tokens)
            "
            :isStablePool="
              isStableLike(pool.poolType) || isUnknownType(pool.poolType)
            "
          />
          {{ isGaugeExpired(address) ? 'Expired' : '' }}
        </div>
      </template>
      <template v-slot:nextPeriodVotesCell="gauge">
        <div v-if="!isLoading" class="px-6 py-4 text-right">
          <GaugeVoteInfo :gauge="gauge" />
        </div>
      </template>
      <template v-slot:voteColumnCell="gauge">
        <div v-if="isWalletReady" class="px-4">
          <BalBtn
            color="blue"
            :outline="true"
            size="sm"
            class="hover:text-white hover:bg-blue-500 focus:text-white focus:bg-blue-500"
            flat
            block
            @click.stop="emit('clickedVote', gauge)"
          >
            {{ $t('veBAL.liquidityMining.table.vote') }}
          </BalBtn>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
