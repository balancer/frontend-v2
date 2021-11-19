<script setup lang="ts">
import { onMounted } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolCreation from '@/composables/pools/usePoolCreation';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { onMounted, ref } from 'vue';

/**
 * STATE
 */
const { userNetworkConfig } = useWeb3();
const {
  seedTokens,
  proceed,
  optimisedLiquidity,
  goBack,
  hasManuallySetInitialBalances,
  updateManualLiquidityFlag,
  autoOptimiseBalances,
  lastManuallySetTokenNum
} = usePoolCreation();

/**
 * LIFECYCLE
 */
onMounted(() => {
  optimiseLiquidity()
});

/**
 * METHODS
 */

function optimiseLiquidity() {
  if (hasManuallySetInitialBalances.value) return;

  for (const token of seedTokens.value) {
    token.amount =
      optimisedLiquidity.value[token.tokenAddress].balanceRequired;
  }
}

function toggleAutoOptimise() {
  autoOptimiseBalances.value = !autoOptimiseBalances.value;

  checkLiquidityOptimisation();
}

function checkLiquidityOptimisation() {
  if (!autoOptimiseBalances.value) return;

  optimiseLiquidity();
}

/**
 * FUNCTIONS
 */
function handleAmountChange(tokenNum) {
  updateManualLiquidityFlag(true);
  lastManuallySetTokenNum.value = tokenNum;

  checkLiquidityOptimisation();
}
</script>

<template>
  <BalCard>
    <BalStack vertical>
      <BalStack vertical spacing="xs">
        <span class="text-sm text-gray-700 dark:text-gray-500">{{
          userNetworkConfig?.name
        }}</span>
        <BalStack horizontal spacing="xs" align="center">
          <button
            @click="goBack"
            class="text-blue-500 hover:text-blue-700 flex"
          >
            <BalIcon class="flex" name="chevron-left" />
          </button>

          <h5 class="font-bold dark:text-gray-300">Set initial liquidity</h5>
          <div class="flex items-center">
            <BalToggle
              name="autoOptimise"
              :checked="autoOptimiseBalances"
              @toggle="toggleAutoOptimise"
            />
            <span class="text-sm pl-2">{{
              $t('autoOptimiseLiquidityToggle.label')
            }}</span>
            <BalTooltip width="64">
              <template v-slot:activator>
                <BalIcon name="info" size="xs" class="text-gray-400 ml-1 flex" />
              </template>
              <div v-html="$t('autoOptimiseLiquidityToggle.tooltip')" />
            </BalTooltip>
          </div>
      </BalStack>
      <BalStack isDynamic vertical>
        <TokenInput
          v-for="(token, i) in seedTokens"
          :key="token.tokenAddress"
          v-model:amount="seedTokens[i].amount"
          v-model:address="seedTokens[i].tokenAddress"
          @update:amount="handleAmountChange(i)"
          :weight="seedTokens[i].weight / 100"
          :name="`initial-token-${seedTokens[i].tokenAddress}`"
          fixedToken
        />
      </BalStack>
      <BalBtn @click="proceed" block color="gradient">Preview</BalBtn>
    </BalStack>
  </BalCard>
</template>
