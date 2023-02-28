<script setup lang="ts">
import TokensWhite from '@/assets/images/icons/tokens_white.svg';
import TokensBlack from '@/assets/images/icons/tokens_black.svg';
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
          <img v-if="darkMode" :src="TokensWhite" />
          <img v-else :src="TokensBlack" />
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
              :pickedTokens="selectedTokens"
            />
          </div>
          <BalChip
            v-if="isLiquidityBootstrapping(pool.poolType)"
            label="LBP"
            color="amber"
          />
          <BalChipNew v-else-if="pool?.isNew" class="mt-1" />
          <PoolWarningTooltip :pool="pool" />
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
          <BalLoadingBlock v-if="!pool?.apr" class="w-12 h-4" />
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
        <PoolsTableActionsCell
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
