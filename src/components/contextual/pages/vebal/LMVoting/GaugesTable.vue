<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import BigNumber from 'bignumber.js';
import { scale } from '@/lib/utils';

import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';

import GaugeVoteModal from './GaugeVoteModal.vue';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { isStableLike, orderedPoolTokens } from '@/composables/usePool';
import { Network } from '@balancer-labs/sdk';
import { networkNameFor, subdomainFor } from '@/composables/useNetwork';
import useWeb3 from '@/services/web3/useWeb3';
import { configService } from '@/services/config/config.service';

/**
 * TYPES
 */
type Props = {
  data?: VotingGaugeWithVotes[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  refetch?: () => void;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  isLoadingMore: false,
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  isPaginated: false
});

const emit = defineEmits(['loadMore']);

/**
 * STATE
 */
const activeGaugeVote = ref<VotingGaugeWithVotes | null>(null);

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
    accessor(gauge) {
      const normalizedVotes = scale(new BigNumber(gauge.votes), -18);
      return fNum2(normalizedVotes.toString(), {
        style: 'percent',
        maximumFractionDigits: 2
      });
    },
    align: 'right',
    id: 'poolGaugeVotes',
    sortKey: gauge => Number(gauge.votes),
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
 * COMPUTED
 */
const unallocatedVoteWeight = computed(() => {
  const totalVotes = 1e4;
  if (props.isLoading || !props.data) return totalVotes;
  const votesRemaining = props.data.reduce((remainingVotes, gauge) => {
    return remainingVotes - parseFloat(gauge.userVotes);
  }, totalVotes);
  return votesRemaining;
});

/**
 * METHODS
 */
function orderedTokenURIs(gauge: VotingGaugeWithVotes): string[] {
  const sortedTokens = orderedPoolTokens(
    gauge.pool.poolType,
    gauge.pool.address,
    gauge.pool.tokens
  );
  return sortedTokens.map(token => gauge.tokenLogoURIs[token?.address || '']);
}

async function handleVoteSuccess() {
  if (props.refetch) {
    await props.refetch();
  }
}

function networkSrc(network: Network) {
  return require(`@/assets/images/icons/networks/${networkNameFor(
    network
  )}.svg`);
}

function redirectToPool(gauge: VotingGaugeWithVotes) {
  const subdomain = subdomainFor(gauge.network);
  const host = configService.env.APP_HOST;
  window.location.href = `https://${subdomain}.${host}/#/pool/${gauge.pool.id}`;
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
      :is-loading-more="isLoadingMore"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :is-paginated="isPaginated"
      :on-row-click="redirectToPool"
      @load-more="emit('loadMore')"
      :initial-state="{
        sortColumn: 'poolValue',
        sortDirection: 'desc'
      }"
    >
      <template #chainColumnHeader>
        <div class="flex items-center">
          <NetworkIcon />
        </div>
      </template>
      <template #iconColumnHeader>
        <div class="flex items-center">
          <CompositionIcon />
        </div>
      </template>
      <template #networkColumnCell="{ network }">
        <div v-if="!isLoading" class="px-6 py-4">
          <div
            class="w-8 h-8 rounded shadow-sm bg-gray-50 flex items-center justify-center"
          >
            <img :src="networkSrc(network)" :alt="network" class="w-6 h-6" />
          </div>
        </div>
      </template>
      <template #iconColumnCell="gauge">
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSet :logoURIs="orderedTokenURIs(gauge)" :width="100" />
        </div>
      </template>
      <template #poolCompositionCell="{ pool }">
        <div v-if="!isLoading" class="px-6 py-4 flex items-center">
          <TokenPills
            :tokens="
              orderedPoolTokens(pool.poolType, pool.address, pool.tokens)
            "
            :isStablePool="isStableLike(pool.poolType)"
          />
        </div>
      </template>
      <template #voteColumnCell="gauge">
        <div v-if="isWalletReady" class="px-4">
          <BalBtn
            color="blue"
            :outline="true"
            size="sm"
            flat
            block
            @click.stop="activeGaugeVote = gauge"
          >
            {{ $t('veBAL.liquidityMining.table.vote') }}
          </BalBtn>
        </div>
      </template>
    </BalTable>
  </BalCard>
  <teleport to="#modal">
    <GaugeVoteModal
      v-if="!!activeGaugeVote"
      @close="activeGaugeVote = null"
      :gauge="activeGaugeVote"
      :unallocatedVoteWeight="unallocatedVoteWeight"
    />
  </teleport>
</template>
