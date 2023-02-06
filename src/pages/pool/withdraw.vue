<script setup lang="ts">
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm/WithdrawForm.vue';
import WithdrawFormV2 from '@/components/forms/pool_actions/WithdrawForm/WithdrawFormV2.vue';
import SwapSettingsPopover, {
  SwapSettingsContext,
} from '@/components/popovers/SwapSettingsPopover.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { ExitPoolProvider } from '@/providers/local/exit-pool.provider';
import { configService } from '@/services/config/config.service';
import { usePool } from '@/composables/usePool';
import useWithdrawPageTabs, {
  tabs,
  Tab,
} from '@/composables/pools/useWithdrawPageTabs';
import { oneMinInMs } from '@/composables/useTime';
import { useIntervalFn } from '@vueuse/core';
import { computed, onMounted } from 'vue';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';

/**
 * COMPOSABLES
 */
const { network } = configService;
const { pool, poolQuery, loadingPool, transfersAllowed } = usePoolTransfers();
const { isDeepPool } = usePool(pool);
const { activeTab, resetTabs } = useWithdrawPageTabs();

// Instead of refetching pool data on every block, we refetch every minute to prevent
// overfetching a heavy request on short blocktime networks like Polygon.
// TODO: Don't refetch whole pool, only update balances and weights with
// onchain calls. i.e. only refetch what's required to be up to date for joins/exits.
useIntervalFn(poolQuery.refetch.value, oneMinInMs);

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean =>
    loadingPool.value || !transfersAllowed.value || isLoadingSor.value
);

onMounted(() => resetTabs());
</script>

<template>
  <div class="px-4 sm:px-0 mx-auto max-w-md">
    <BalLoadingBlock v-if="isLoading || !pool" class="h-96" />
    <BalCard v-else shadow="xl" exposeOverflow noBorder>
      <template #header>
        <div class="w-full">
          <div class="text-xs leading-none text-secondary">
            {{ network.chainName }}
          </div>
          <div class="flex justify-between items-center">
            <h4>{{ $t('withdrawFromPool') }}</h4>
            <SwapSettingsPopover :context="SwapSettingsContext.invest" />
          </div>
          <BalTabs
            v-if="isDeepPool"
            v-model="activeTab"
            :tabs="tabs"
            class="p-0 m-0 -mb-px whitespace-nowrap"
            noPad
          />
        </div>
      </template>
      <ExitPoolProvider
        v-if="isDeepPool"
        :isSingleAssetExit="activeTab === Tab.SingleToken"
        :pool="pool"
      >
        <WithdrawFormV2 />
      </ExitPoolProvider>
      <WithdrawForm v-else :pool="pool" />
    </BalCard>
  </div>
</template>
