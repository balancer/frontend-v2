<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import BalChipNew from '@/components/chips/BalChipNew.vue';
import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import { POOL_MIGRATIONS_MAP } from '@/components/forms/pool_actions/MigrateForm/constants';
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
  totalAprLabel,
} from '@/composables/usePool';
import { bnum } from '@/lib/utils';
import { PoolWithShares } from '@/services/pool/types';
import { POOLS } from '@/constants/pools';

import PoolsTableActionsCell from './PoolsTableActionsCell.vue';
import TokenPills from './TokenPills/TokenPills.vue';

/**
 * TYPES
 */
type Props = {
  data?: PoolWithShares[];
  poolsType?: 'unstaked' | 'staked';
  isLoading?: boolean;
  isLoadingMore?: boolean;
  showPoolShares?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  selectedTokens?: string[];
  hiddenColumns?: string[];
  showBoost?: boolean;
  columnStates?: Record<string, string>;
  skeletonClass?: string;
};

/**
 * PROPS & EMITS
 */

const props = withDefaults(defineProps<Props>(), {
  poolsType: 'unstaked',
  isLoadingMore: false,
  showPoolShares: false,
  noPoolsLabel: 'No pools',
  isPaginated: false,
  hiddenColumns: () => [],
  showBoost: false,
  columnStates: () => ({}),
  data: () => [],
  selectedTokens: () => [],
  skeletonClass: 'h-64',
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
    noGrow: true,
  },
  {
    name: t('composition'),
    id: 'poolName',
    accessor: 'id',
    Cell: 'poolNameCell',
    width: props.hiddenColumns.length >= 2 ? wideCompositionWidth.value : 350,
  },
  {
    name: t('myBalance'),
    accessor: pool =>
      fNum2(pool.shares, {
        style: 'currency',
        maximumFractionDigits: 0,
        fixedFormat: true,
      }),
    align: 'right',
    id: 'myBalance',
    hidden: !props.showPoolShares,
    sortKey: pool => Number(pool.shares),
    width: 160,
    cellClassName: 'font-numeric',
  },
  {
    name: t('poolValue'),
    accessor: pool =>
      fNum2(pool.totalLiquidity, {
        style: 'currency',
        maximumFractionDigits: 0,
      }),
    align: 'right',
    id: 'poolValue',
    sortKey: pool => {
      const apr = Number(pool.totalLiquidity);
      if (apr === Infinity || isNaN(apr)) return 0;
      return apr;
    },
    width: 150,
    cellClassName: 'font-numeric',
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
    cellClassName: 'font-numeric',
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
    cellClassName: 'font-numeric',
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
    width: 250,
  },
  {
    name: t('expiryDate'),
    Cell: 'lockEndDateCell',
    accessor: 'lockedEndDate',
    align: 'right',
    id: 'lockEndDate',
    width: 150,
  },
  {
    name: t('migrate'),
    Cell: 'migrateCell',
    accessor: 'migrate',
    align: 'center',
    id: 'migrate',
    width: 150,
  },
  {
    name: t('actions'),
    Cell: 'actionsCell',
    accessor: 'actions',
    align: 'center',
    id: 'actions',
    width: 150,
  },
]);

const visibleColumns = computed(() =>
  columns.value.filter(column => !props.hiddenColumns.includes(column.id))
);

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
      to: POOL_MIGRATIONS_MAP[pool.id].toPoolId,
    },
    query: { returnRoute: 'home' },
  });
}

function aprLabelFor(pool: PoolWithShares): string {
  const poolAPRs = pool?.apr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, pool.boost);
}

function lockedUntil(lockEndDate?: number) {
  return lockEndDate ? format(lockEndDate, PRETTY_DATE_FORMAT) : '—';
}

function iconAddresses(pool: PoolWithShares) {
  return POOLS.Metadata[pool.id]?.hasIcon
    ? [pool.address]
    : orderedTokenAddresses(pool);
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
      :isLoading="isLoading"
      :isLoadingMore="isLoadingMore"
      :skeletonClass="skeletonClass"
      sticky="both"
      :square="upToLargeBreakpoint"
      :link="{
        to: 'pool',
        getParams: pool => ({ id: pool.id || '' }),
      }"
      :onRowClick="handleRowClick"
      :isPaginated="isPaginated"
      :initialState="{
        sortColumn: 'poolValue',
        sortDirection: 'desc',
      }"
      @load-more="emit('loadMore')"
    >
      <template #iconColumnHeader>
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
      <template #iconColumnCell="pool">
        <div v-if="!isLoading" class="py-4 px-6">
          <BalAssetSet :addresses="iconAddresses(pool)" :width="100" />
        </div>
      </template>
      <template #poolNameCell="pool">
        <div v-if="!isLoading" class="flex items-center py-4 px-6">
          <div v-if="POOLS.Metadata[pool.id]" class="text-left">
            {{ POOLS.Metadata[pool.id].name }}
          </div>
          <div v-else>
            <TokenPills
              :tokens="orderedPoolTokens(pool, pool.tokens)"
              :isStablePool="isStableLike(pool.poolType)"
              :selectedTokens="selectedTokens"
            />
          </div>
          <BalChipNew v-if="pool?.isNew" class="mt-1" />
        </div>
      </template>
      <template #volumeCell="pool">
        <div
          :key="columnStates.volume"
          class="flex justify-end py-4 px-6 -mt-1 font-numeric"
        >
          <BalLoadingBlock v-if="!pool?.volumeSnapshot" class="w-12 h-4" />
          <span v-else class="text-right">
            {{
              fNum2(pool?.volumeSnapshot, {
                style: 'currency',
                maximumFractionDigits: 0,
              })
            }}
          </span>
        </div>
      </template>
      <template #aprCell="pool">
        <div
          :key="columnStates.aprs"
          class="flex justify-end py-4 px-6 -mt-1 text-right font-numeric"
        >
          <BalLoadingBlock
            v-if="!pool?.apr?.total?.unstaked"
            class="w-12 h-4"
          />
          <template v-else>
            {{ aprLabelFor(pool) }}
            <APRTooltip v-if="pool?.apr?.total?.unstaked" :pool="pool" />
          </template>
        </div>
      </template>
      <template #migrateCell="pool">
        <div class="flex justify-center py-4 px-2">
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
      <template #lockEndDateCell="pool">
        <div class="py-4 px-6 text-right">
          {{ lockedUntil(pool.lockedEndDate) }}
        </div>
      </template>
      <template #actionsCell="pool">
        <PoolsTableActionsCell
          :pool="pool"
          :poolsType="poolsType"
          @click:stake="pool => emit('triggerStake', pool)"
          @click:migrate="pool => navigateToPoolMigration(pool)"
        />
      </template>
    </BalTable>
  </BalCard>
</template>
