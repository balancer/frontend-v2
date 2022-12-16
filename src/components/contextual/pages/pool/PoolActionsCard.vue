<script setup lang="ts">
import { computed, toRef } from 'vue';
import useWithdrawMath from '@/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath';
import { isJoinsDisabled, usePool } from '@/composables/usePool';
import useNetwork from '@/composables/useNetwork';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { isSoftMigratablePool } from '@/components/forms/pool_actions/MigrateForm/constants';
import { Goals, trackGoal } from '@/composables/useFathom';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  missingPrices: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { hasBpt } = useWithdrawMath(toRef(props, 'pool'));
const { isMigratablePool, hasNonApprovedRateProviders } = usePool(
  toRef(props, 'pool')
);
const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();
const { networkSlug } = useNetwork();

/**
 * COMPUTED
 */
const joinDisabled = computed(
  (): boolean =>
    isJoinsDisabled(props.pool.id) ||
    hasNonApprovedRateProviders.value ||
    (isMigratablePool(props.pool) && !isSoftMigratablePool(props.pool.id))
);
</script>

<template>
  <div
    class="p-4 w-full bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-900"
  >
    <BalBtn
      v-if="!isWalletReady"
      :label="$t('connectWallet')"
      color="gradient"
      block
      @click="startConnectWithInjectedProvider"
    />
    <div v-else class="grid grid-cols-2 gap-2">
      <BalBtn
        :tag="joinDisabled ? 'div' : 'router-link'"
        :to="{ name: 'invest', params: { networkSlug } }"
        :label="$t('addLiquidity')"
        color="gradient"
        :disabled="joinDisabled"
        block
        @click="trackGoal(Goals.ClickAddLiquidity)"
      />
      <BalBtn
        :tag="hasBpt ? 'router-link' : 'div'"
        :to="{ name: 'withdraw', params: { networkSlug } }"
        :label="$t('withdraw.label')"
        :disabled="!hasBpt"
        color="blue"
        outline
        block
        @click="trackGoal(Goals.ClickWithdraw)"
      />
    </div>
  </div>
</template>
