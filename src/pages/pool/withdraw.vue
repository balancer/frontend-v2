<script setup lang="ts">
import WithdrawForm from '@/components/forms/pool_actions/WithdrawForm/WithdrawForm.vue';
import TradeSettingsPopover, {
  TradeSettingsContext,
} from '@/components/popovers/TradeSettingsPopover.vue';
import usePoolTransfers from '@/composables/contextual/pool-transfers/usePoolTransfers';
import { oneMinInMs } from '@/composables/useTime';
import { configService } from '@/services/config/config.service';
import { useIntervalFn } from '@vueuse/core';

/**
 * STATE
 */
const { network } = configService;
const { pool, poolQuery, loadingPool, transfersAllowed } = usePoolTransfers();

// Instead of refetching pool data on every block, we refetch every minute to prevent
// overfetching a heavy request on short blocktime networks like Polygon.
// TODO: Don't refetch whole pool, only update balances and weights with
// onchain calls. i.e. only refetch what's required to be up to date for joins/exits.
useIntervalFn(poolQuery.refetch.value, oneMinInMs);
</script>

<template>
  <div>
    <BalLoadingBlock
      v-if="loadingPool || !pool || !transfersAllowed"
      class="h-96"
    />
    <BalCard v-else shadow="xl" exposeOverflow noBorder>
      <template #header>
        <div class="w-full">
          <div class="text-xs leading-none text-secondary">
            {{ network.chainName }}
          </div>
          <div class="flex justify-between items-center">
            <h4>{{ $t('withdrawFromPool') }}</h4>
            <TradeSettingsPopover :context="TradeSettingsContext.invest" />
          </div>
        </div>
      </template>
      <WithdrawForm :pool="pool" />
    </BalCard>
  </div>
</template>
