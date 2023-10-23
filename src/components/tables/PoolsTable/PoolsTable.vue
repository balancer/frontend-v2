<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { ColumnDefinition } from '@/components/_global/BalTable/types';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';

import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import useFathom from '@/composables/useFathom';
import useNumbers from '@/composables/useNumbers';
import useNetwork from '@/composables/useNetwork';
import {
  absMaxApr,
  fiatValueOf,
  isMigratablePool,
  isStableLike,
  orderedPoolTokens,
  orderedTokenAddresses,
  totalAprLabel,
  isLBP,
  shouldHideAprs,
} from '@/composables/usePoolHelpers';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { APR_THRESHOLD, VOLUME_THRESHOLD } from '@/constants/pools';
import { configService } from '@/services/config/config.service';

import PoolsTableActionsCell from './PoolsTableActionsCell.vue';
import TokenPills from './TokenPills/TokenPills.vue';
import TokensWhite from '@/assets/images/icons/tokens_white.svg';
import TokensBlack from '@/assets/images/icons/tokens_black.svg';
import { poolMetadata } from '@/lib/config/metadata';
import PoolsTableExtraInfo from './PoolsTableExtraInfo.vue';
import PoolsTableActionSelector from './PoolsTableActionSelector.vue';
import { PoolAction } from '@/components/contextual/pages/pools/types';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  data?: Pool[];
  poolsType?: 'unstaked' | 'staked';
  isLoading?: boolean;
  isLoadingMore?: boolean;
  showPoolShares?: boolean;
  noPoolsLabel?: string;
  isPaginated?: boolean;
  sortColumn?: string;
  selectedTokens?: string[];
  hiddenColumns?: string[];
  showBoost?: boolean;
  showActions?: boolean;
  columnStates?: Record<string, string>;
  skeletonClass?: string;
  shares?: Record<string, string>;
  boosts?: Record<string, string>;
  defaultPoolActions?: PoolAction[];
  shouldPokePoolsMap?: Record<string, string>;
  hasNonPrefGaugesPoolsAddresses?: string[];
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
  sortColumn: 'totalLiquidity',
  hiddenColumns: () => [],
  showBoost: false,
  showActions: false,
  columnStates: () => ({}),
  data: () => [],
  selectedTokens: () => [],
  skeletonClass: 'h-64',
});

const emit = defineEmits<{
  (e: 'loadMore'): void;
  (e: 'triggerVote'): void;
  (e: 'triggerStake', value: Pool): void;
  (e: 'triggerUnstake', value: Pool): void;
  (e: 'triggerCheckpoint', value: Pool): void;
  (e: 'onColumnSort', value: string): void;
}>();
/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const router = useRouter();
const { t } = useI18n();
const { trackGoal, Goals } = useFathom();
const { darkMode } = useDarkMode();
const { upToLargeBreakpoint, upToSmallBreakpoint, isMobile } = useBreakpoints();
const { networkSlug } = useNetwork();
const { isWalletReady } = useWeb3();

const wideCompositionWidth = computed(() => {
  if (upToSmallBreakpoint.value) return 250;
  return 350;
});

/**
 * DATA
 */
const columns = computed<ColumnDefinition<Pool>[]>(() => [
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
    name: t('myBoost'),
    accessor: pool => `${bnum(boostFor(pool)).toFixed(3)}x`,
    align: 'right',
    id: 'myBoost',
    hidden: !props.showBoost,
    sortKey: pool => Number(boostFor(pool)),
    width: 150,
    cellClassName: 'font-numeric',
  },
  {
    name: t('myBalance'),
    accessor: pool =>
      fNum(balanceValue(pool), {
        style: 'currency',
        maximumFractionDigits: 0,
        fixedFormat: true,
      }),
    align: 'right',
    id: 'myBalance',
    hidden: !props.showPoolShares,
    sortKey: pool => Number(balanceValue(pool)),
    width: 160,
    cellClassName: 'font-numeric',
  },
  {
    name: t('poolValue'),
    accessor: pool =>
      fNum(pool.totalLiquidity || 0, {
        style: 'currency',
        maximumFractionDigits: 0,
      }),
    align: 'right',
    id: 'totalLiquidity',
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
    id: 'volume',
    Cell: 'volumeCell',
    sortKey: pool => {
      const volume = Number(pool?.volumeSnapshot);
      if (volume === Infinity || isNaN(volume) || volume > VOLUME_THRESHOLD)
        return 0;
      return volume;
    },
    width: 175,
    cellClassName: 'font-numeric',
  },
  {
    name: props.showPoolShares ? t('myApr') : t('apr'),
    Cell: 'aprCell',
    accessor: pool => pool?.apr?.min.toString() || '0',
    align: 'right',
    id: 'apr',
    sortKey: pool => {
      let apr = 0;

      if (pool?.apr) {
        apr = Number(absMaxApr(pool.apr, pool.boost));
      }

      return isFinite(apr) && (pool.apr?.swapFees || 0) < APR_THRESHOLD
        ? apr
        : 0;
    },
    width: 150,
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
    align: 'right',
    id: 'actions',
    hidden: !props.showActions,
    width: 150,
  },
]);

const visibleColumns = computed(() =>
  columns.value.filter(column => !props.hiddenColumns.includes(column.id))
);

/**
 * METHODS
 */
function handleRowClick(pool: Pool, inNewTab?: boolean) {
  trackGoal(Goals.ClickPoolsTableRow);
  const route = router.resolve({
    name: 'pool',
    params: { id: pool.id, networkSlug },
  });
  inNewTab ? window.open(route.href) : router.push(route);
}

function navigateToPoolMigration(pool: Pool) {
  router.push({
    name: 'migrate-pool',
    params: {
      from: pool.id,
      to: configService.network.pools.Migrations?.[pool.id].toPoolId,
    },
    query: { returnRoute: 'home' },
  });
}

function balanceValue(pool: Pool): string {
  const bpt = props?.shares?.[pool.id] || '0';
  return fiatValueOf(pool, bpt);
}

function boostFor(pool: Pool): string {
  return pool.boost || props?.boosts?.[pool.id] || '1';
}

function aprLabelFor(pool: Pool): string {
  const poolAPRs = pool?.apr;
  if (!poolAPRs) return '0';

  return totalAprLabel(poolAPRs, boostFor(pool), isWalletReady.value);
}

function lockedUntil(lockEndDate?: number) {
  return lockEndDate ? format(lockEndDate, PRETTY_DATE_FORMAT) : '—';
}

function iconAddresses(pool: Pool) {
  return poolMetadata(pool.id)?.hasIcon
    ? [pool.address]
    : orderedTokenAddresses(pool);
}
function addLiquidity(id: string) {
  router.push({
    name: 'add-liquidity',
    params: {
      id,
      networkSlug,
    },
  });
}
function removeLiquidity(id: string) {
  router.push({
    name: 'withdraw',
    params: {
      id,
      networkSlug,
    },
  });
}
function goToPoolPage(id: string) {
  router.push({
    name: 'pool',
    params: {
      id,
      networkSlug,
    },
  });
}
</script>

<template>
  <BalCard
    shadow="lg"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
    exposeOverflow
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
      :onRowClick="handleRowClick"
      :isPaginated="isPaginated"
      isOnlyDescSort
      :initialState="{
        sortColumn: sortColumn,
        sortDirection: 'desc',
      }"
      @on-column-sort="emit('onColumnSort', $event)"
      @load-more="emit('loadMore')"
    >
      <template #iconColumnHeader>
        <div class="flex items-center">
          <img
            v-if="darkMode"
            :src="TokensWhite"
            alt="token"
            loading="lazy"
            width="24"
            height="15"
          />
          <img
            v-else
            :src="TokensBlack"
            alt="token"
            loading="lazy"
            width="24"
            height="15"
          />
        </div>
      </template>
      <template #iconColumnCell="pool">
        <div v-if="!isLoading" class="py-4 px-6" :data-testid="pool?.id">
          <BalAssetSet
            :addresses="iconAddresses(pool)"
            :width="100"
            :size="isMobile ? 28 : 32"
          />
        </div>
      </template>
      <template #poolNameCell="pool">
        <div v-if="!isLoading" class="flex items-center py-4 px-6">
          <div v-if="poolMetadata(pool.id)?.name" class="pr-2 text-left">
            {{ poolMetadata(pool.id)?.name }}
          </div>
          <div v-else>
            <TokenPills
              :tokens="orderedPoolTokens(pool, pool.tokens)"
              :isStablePool="isStableLike(pool.poolType)"
              :selectedTokens="selectedTokens"
              :pickedTokens="selectedTokens"
            />
          </div>
          <PoolsTableExtraInfo :pool="pool" />
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
              fNum(
                pool?.volumeSnapshot < VOLUME_THRESHOLD
                  ? pool?.volumeSnapshot
                  : '-',
                {
                  style: 'currency',
                  maximumFractionDigits: 0,
                }
              )
            }}
          </span>
        </div>
      </template>
      <template #aprCell="pool">
        <div
          :key="columnStates.aprs"
          :class="[
            'flex justify-end py-4 px-6 -mt-1 font-numeric text-right',
            {
              'text-gray-300 dark:text-gray-600 line-through': isLBP(
                pool.poolType
              ),
            },
          ]"
        >
          <span v-if="!pool?.apr || shouldHideAprs(pool.id)">-</span>
          <template v-else>
            {{ aprLabelFor(pool) }}
            <BalTooltip
              v-if="isLBP(pool.poolType)"
              width="36"
              :text="$t('lbpAprTooltip')"
              iconSize="sm"
              iconClass="ml-1"
            />
            <APRTooltip v-else-if="pool?.apr" :pool="pool" />
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
        <PoolsTableActionSelector
          v-if="defaultPoolActions"
          :defaultPoolActions="defaultPoolActions"
          :pool="pool"
          :showPokeAction="Boolean(shouldPokePoolsMap?.[pool.address]) || false"
          :showMigrateGaugeAction="
            hasNonPrefGaugesPoolsAddresses?.includes(pool.address) || false
          "
          @click:add="addLiquidity(pool.id)"
          @click:remove="removeLiquidity(pool.id)"
          @click:unstake="pool => emit('triggerUnstake', pool)"
          @click:stake="pool => emit('triggerStake', pool)"
          @click:vote="emit('triggerVote')"
          @click:migrate-gauge="goToPoolPage(pool.id)"
          @click:poke="pool => emit('triggerCheckpoint', pool)"
        />
        <PoolsTableActionsCell
          v-else
          :pool="pool"
          :poolsType="poolsType"
          @click:stake="pool => emit('triggerStake', pool)"
          @click:unstake="pool => emit('triggerUnstake', pool)"
          @click:migrate="pool => navigateToPoolMigration(pool)"
        />
      </template>
    </BalTable>
  </BalCard>
</template>
