<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import BalChipNew from '@/components/chips/BalChipNew.vue';
import { POOL_MIGRATIONS_MAP } from '@/components/forms/pool_actions/MigrateForm/constants';
import { PoolMigrationType } from '@/components/forms/pool_actions/MigrateForm/types';
import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import useFathom from '@/composables/useFathom';
import useNumbers from '@/composables/useNumbers';
import {
  absMaxApr,
  isMigratablePool,
  isStableLike,
  orderedPoolTokens,
  orderedTokenAddresses,
  totalAprLabel
} from '@/composables/usePool';
import { POOLS } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import { PoolWithShares } from '@/services/pool/types';

import TokenPills from './TokenPills/TokenPills.vue';

/**
 * TYPES
 */
type Props = {
  data?: PoolWithShares[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  showPoolShares?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  selectedTokens?: string[];
  hiddenColumns?: string[];
  showBoost?: boolean;
  columnStates?: Record<string, string>;
};

/**
 * PROPS & EMITS
 */

const props = withDefaults(defineProps<Props>(), {
  isLoadingMore: false,
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  isPaginated: false,
  hiddenColumns: () => [],
  showBoost: false,
  columnStates: () => ({})
});

const emit = defineEmits(['loadMore', 'triggerStake']);

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const router = useRouter();
const { t } = useI18n();
const { trackGoal, Goals } = useFathom();
const { darkMode } = useDarkMode();
const { upToLargeBreakpoint, upToMediumBreakpoint } = useBreakpoints();

const wideCompositionWidth = computed(() =>
  upToMediumBreakpoint.value ? 450 : undefined
);

/**
 * DATA
 */
const columns = computed<ColumnDefinition<PoolWithShares>[]>(() => [
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
    width: props.hiddenColumns.length >= 2 ? wideCompositionWidth.value : 350
  },
  {
    name: t('myBalance'),
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
    name: t('poolValue'),
    accessor: pool =>
      fNum2(pool.totalLiquidity, {
        style: 'currency',
        maximumFractionDigits: 0
      }),
    align: 'right',
    id: 'poolValue',
    sortKey: pool => {
      const apr = Number(pool.totalLiquidity);
      if (apr === Infinity || isNaN(apr)) return 0;
      return apr;
    },
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: t('volume24h', [t('hourAbbrev')]),
    accessor: pool => pool?.volumeSnapshot || '0',
    align: 'right',
    id: 'poolVolume',
    Cell: 'volumeCell',
    sortKey: pool => {
      const volume = Number(pool?.volumeSnapshot);
      if (volume === Infinity || isNaN(volume)) return 0;
      return volume;
    },
    width: 175,
    cellClassName: 'font-numeric'
  },
  {
    name: t('myBoost'),
    accessor: pool =>
      pool?.boost ? `${bnum(pool?.boost).toFixed(3)}x` : 'N/A',
    align: 'right',
    id: 'myBoost',
    hidden: !props.showBoost,
    sortKey: pool => Number(pool?.boost || '0'),
    width: 150,
    cellClassName: 'font-numeric'
  },
  {
    name: props.showPoolShares ? t('myApr') : t('apr'),
    Cell: 'aprCell',
    accessor: pool => pool?.apr?.total.unstaked || '0',
    align: 'right',
    id: 'poolApr',
    sortKey: pool => {
      let apr = 0;

      if (pool?.apr) {
        apr = Number(absMaxApr(pool.apr, pool.boost));
      }

      return isFinite(apr) ? apr : 0;
    },
    width: 250
  },
  {
    name: t('migrate'),
    Cell: 'migrateCell',
    accessor: 'migrate',
    align: 'center',
    id: 'migrate',
    width: 150
  },
  {
    name: t('stake'),
    Cell: 'stakeCell',
    accessor: 'stake',
    align: 'center',
    id: 'stake',
    width: 150
  }
]);

const visibleColumns = computed(() =>
  columns.value.filter(column => !props.hiddenColumns.includes(column.id))
);

const stakablePoolIds = computed((): string[] => POOLS.Stakable.AllowList);

/**
 * METHODS
 */
function handleRowClick(pool: PoolWithShares) {
  trackGoal(Goals.ClickPoolsTableRow);
  router.push({ name: 'pool', params: { id: pool.id } });
}

function navigateToPoolMigration(pool: PoolWithShares) {
  router.push({
    name: 'migrate-pool',
    params: {
      from: pool.id,
      to: POOL_MIGRATIONS_MAP[PoolMigrationType.AAVE_BOOSTED_POOL].toPoolId
    },
    query: { returnRoute: 'home' }
  });
}

function aprLabelFor(pool: PoolWithShares): string {
  const poolAPRs = pool?.apr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, pool.boost);
}
</script>

<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="visibleColumns"
      :data="data"
      :noResultsLabel="noPoolsLabel"
      :is-loading="isLoading"
      :is-loading-more="isLoadingMore"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      :link="{
        to: 'pool',
        getParams: pool => ({ id: pool.id || '' })
      }"
      :on-row-click="handleRowClick"
      :is-paginated="isPaginated"
      @load-more="emit('loadMore')"
      :initial-state="{
        sortColumn: 'poolValue',
        sortDirection: 'desc'
      }"
    >
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
      <template v-slot:iconColumnCell="pool">
        <div v-if="!isLoading" class="px-6 py-4">
          <BalAssetSet :addresses="orderedTokenAddresses(pool)" :width="100" />
        </div>
      </template>
      <template v-slot:poolNameCell="pool">
        <div v-if="!isLoading" class="px-6 py-4 flex items-center">
          <TokenPills
            :tokens="
              orderedPoolTokens(pool.poolType, pool.address, pool.tokens)
            "
            :isStablePool="isStableLike(pool.poolType)"
            :selectedTokens="selectedTokens"
          />
          <BalChipNew v-if="pool?.isNew" class="ml-2" />
        </div>
      </template>
      <template v-slot:volumeCell="pool">
        <div
          class="px-6 py-4 -mt-1 flex justify-end font-numeric"
          :key="columnStates.volume"
        >
          <span v-if="!pool?.volumeSnapshot">-</span>
          <span v-else class="text-right">
            {{
              fNum2(pool?.volumeSnapshot, {
                style: 'currency',
                maximumFractionDigits: 0
              })
            }}
          </span>
        </div>
      </template>
      <template v-slot:aprCell="pool">
        <div
          class="px-6 py-4 -mt-1 flex justify-end font-numeric"
          :key="columnStates.aprs"
        >
          <BalLoadingBlock
            v-if="!pool?.apr?.total?.unstaked"
            class="h-4 w-12"
          />
          <template v-else>
            {{ aprLabelFor(pool) }}
            <APRTooltip v-if="pool?.apr?.total?.unstaked" :pool="pool" />
          </template>
        </div>
      </template>
      <template v-slot:migrateCell="pool">
        <div class="px-2 py-4 flex justify-center">
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
      <template v-slot:stakeCell="pool">
        <div class="px-2 py-4 flex justify-center">
          <BalBtn
            v-if="stakablePoolIds.includes(pool.id)"
            color="gradient"
            size="sm"
            @click.prevent="$emit('triggerStake', pool)"
          >
            {{ $t('stake') }}
          </BalBtn>
          <div v-else>{{ $t('notAvailable') }}</div>
        </div>
      </template>
    </BalTable>
  </BalCard>
</template>
