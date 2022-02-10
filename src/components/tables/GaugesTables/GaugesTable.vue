<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import {
  DecoratedPoolWithGaugeShares,
  PoolToken
} from '@/services/balancer/subgraph/types';

import { getAddress } from '@ethersproject/address';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useFathom from '@/composables/useFathom';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import {
  isStableLike,
  isStablePhantom,
  isMigratablePool
} from '@/composables/usePool';

import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import { POOL_MIGRATIONS_MAP } from '@/components/forms/pool_actions/MigrateForm/constants';
import { PoolMigrationType } from '@/components/forms/pool_actions/MigrateForm/types';

import TokenPills from '../PoolsTable/TokenPills/TokenPills.vue';

/**
 * TYPES
 */
type Props = {
  data?: DecoratedPoolWithGaugeShares[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  showPoolShares?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  selectedTokens?: string[];
  showMigrationColumn?: boolean;
};

/**
 * PROPS & EMITS
 */

const props = withDefaults(defineProps<Props>(), {
  isLoadingMore: false,
  showPoolShares: false,
  showMigrationColumn: false,
  noPoolsLabel: 'No pools',
  isPaginated: false
});

const emit = defineEmits(['loadMore']);

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const router = useRouter();
const { t } = useI18n();
const { trackGoal, Goals } = useFathom();
const { darkMode } = useDarkMode();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * DATA
 */
const columns = ref<ColumnDefinition<DecoratedPoolWithGaugeShares>[]>([
  {
    name: 'Network',
    id: 'network',
    accessor: 'uri',
    Header: 'networkColumnHeader',
    Cell: 'networkColumnCell',
    width: 125,
    noGrow: true
  },
  {
    name: 'Icons',
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 125,
    noGrow: true
  },
  {
    name: t('composition'),
    id: 'poolName',
    accessor: 'id',
    Cell: 'poolNameCell',
    width: 350
  },
  {
    name: t('votes'),
    accessor: pool =>
      fNum2(pool.gauge.votePercent, {
        style: 'percent',
        maximumFractionDigits: 2
      }),
    align: 'right',
    id: 'poolGaugeVotes',
    sortKey: pool => Number(pool.gauge.votePercent),
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('nextAPR'),
    accessor: pool => {
      const minAPR = fNum2(pool.gauge.nextAPRMin, {
        style: 'percent',
        maximumFractionDigits: 2
      });
      const maxAPR = fNum2(pool.gauge.nextAPRMax, {
        style: 'percent',
        maximumFractionDigits: 2
      });
      return `${minAPR}-${maxAPR}`;
    },
    align: 'right',
    id: 'poolValue',
    sortKey: pool => {
      const apr = Number(pool.gauge.nextAPRMin);
      if (apr === Infinity || isNaN(apr)) return 0;
      return apr;
    },
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('myLiquidity'),
    accessor: pool =>
      fNum2(pool.shares, {
        style: 'currency',
        maximumFractionDigits: 0,
        fixedFormat: true
      }),
    align: 'right',
    id: 'myBalance',
    hidden: !props.showPoolShares,
    sortKey: pool => Number(pool.shares),
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('myVotes'),
    accessor: pool =>
      fNum2(pool.gauge.votes, {
        style: 'percent',
        maximumFractionDigits: 2
      }),
    align: 'right',
    id: 'myVotes',
    hidden: !props.showPoolShares,
    sortKey: pool => Number(pool.gauge.votes),
    width: 150,
    cellClassName: 'font-numeric'
  }
]);

/**
 * METHODS
 */
function orderedTokenAddressesFor(pool: DecoratedPoolWithGaugeShares) {
  const sortedTokens = orderedPoolTokens(pool);
  return sortedTokens.map(token => getAddress(token.address));
}

function orderedPoolTokens(pool: DecoratedPoolWithGaugeShares): PoolToken[] {
  if (isStablePhantom(pool.poolType))
    return pool.tokens.filter(token => token.address !== pool.address);
  if (isStableLike(pool.poolType)) return pool.tokens;

  const sortedTokens = pool.tokens.slice();
  sortedTokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
  return sortedTokens;
}

function handleRowClick(pool: DecoratedPoolWithGaugeShares) {
  trackGoal(Goals.ClickPoolsTableRow);
  router.push({ name: 'pool', params: { id: pool.id } });
}

function navigateToPoolMigration(pool: DecoratedPoolWithGaugeShares) {
  router.push({
    name: 'migrate-pool',
    params: {
      from: pool.id,
      to: POOL_MIGRATIONS_MAP[PoolMigrationType.AAVE_BOOSTED_POOL].toPoolId
    },
    query: { returnRoute: 'home' }
  });
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
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :link="{
        to: 'pool',
        getParams: pool => ({ id: pool.id })
      }"
      :on-row-click="handleRowClick"
      :is-paginated="isPaginated"
      @load-more="emit('loadMore')"
      :initial-state="{
        sortColumn: 'poolValue',
        sortDirection: 'desc'
      }"
    >
      <template v-slot:networkColumnHeader>
        <div class="flex items-center">
          <img
            v-if="darkMode"
            :src="require('@/assets/images/icons/tokens_white.svg')"
          />
          <img
            v-else
            :src="require('@/assets/images/icons/tokens_black.svg')"
          />
        </div>
      </template>
      <template v-slot:iconColumnHeader>
        <div class="flex items-center">
          <img
            v-if="darkMode"
            :src="require('@/assets/images/icons/tokens_white.svg')"
          />
          <img
            v-else
            :src="require('@/assets/images/icons/tokens_black.svg')"
          />
        </div>
      </template>
      <template v-slot:networkColumnCell="pool">
        <div v-if="!isLoading" class="px-6 py-4">
          <img
            :src="
              require(`@/assets/images/icons/networks/${pool.network.id}.svg`)
            "
            :alt="pool.network.name"
            class="w-5 h-5 rounded-full shadow-sm"
          />
        </div>
      </template>
      <template v-slot:iconColumnCell="pool">
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSet
            :addresses="orderedTokenAddressesFor(pool)"
            :width="100"
          />
        </div>
      </template>
      <template v-slot:poolNameCell="pool">
        <div v-if="!isLoading" class="px-6 py-4 flex items-center">
          <TokenPills
            :tokens="orderedPoolTokens(pool)"
            :isStablePool="isStableLike(pool.poolType)"
            :selectedTokens="selectedTokens"
          />
          <BalChip
            v-if="pool.dynamic.isNewPool"
            color="red"
            size="sm"
            class="ml-2 uppercase"
            :outline="false"
          >
            {{ $t('new') }}
          </BalChip>
        </div>
      </template>
      <template v-slot:aprCell="pool">
        <div class="px-6 py-4 -mt-1 flex justify-end font-numeric">
          {{
            Number(pool.dynamic.apr.pool) > 10000
              ? '-'
              : fNum2(pool.dynamic.apr.total, FNumFormats.percent)
          }}
          <LiquidityAPRTooltip :pool="pool" />
        </div>
      </template>
      <template v-slot:migrateCell="pool">
        <div class="px-6 py-4 flex justify-end">
          <BalBtn
            v-if="isMigratablePool(pool)"
            color="gradient"
            size="sm"
            @click.prevent="navigateToPoolMigration(pool)"
          >
            {{ $t('migrate') }}
          </BalBtn>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
