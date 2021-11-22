<script setup lang="ts">
import { onMounted, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolCreation from '@/composables/pools/usePoolCreation';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';

/**
 * STATE
 */
const { userNetworkConfig } = useWeb3();
const {
  seedTokens,
  proceed,
  optimisedLiquidity,
  scaledLiquidity,
  goBack,
  manuallySetToken,
  updateManuallySetToken,
  autoOptimiseBalances
} = usePoolCreation();

/**
 * LIFECYCLE
 */
onMounted(() => {
  optimiseLiquidity();
  scaleLiquidity();
});

/**
 * METHODS
 */

function optimiseLiquidity() {
  if (manuallySetToken.value) return;

  for (const token of seedTokens.value) {
    token.amount = optimisedLiquidity.value[token.tokenAddress].balanceRequired;
  }
}

function scaleLiquidity() {
  if (!autoOptimiseBalances.value) return;

  for (const token of seedTokens.value) {
    if (token.tokenAddress !== manuallySetToken.value) {
      token.amount = scaledLiquidity.value[token.tokenAddress].balanceRequired;
    }
  }
}

function toggleAutoOptimise() {
  autoOptimiseBalances.value = !autoOptimiseBalances.value;

  checkLiquidityScaling();
}

function checkLiquidityScaling() {
  if (!autoOptimiseBalances.value) return;

  scaleLiquidity();
}

/**
 * FUNCTIONS
 */
function handleAmountChange(tokenAddress) {
  updateManuallySetToken(tokenAddress);

  checkLiquidityScaling();
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
        </BalStack>
        <BalStack horizontal spacing="xs" align="center">
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
        </BalStack>
      </BalStack>
      <BalStack isDynamic vertical>
        <TokenInput
          v-for="(token, i) in seedTokens"
          :key="token.tokenAddress"
          v-model:amount="seedTokens[i].amount"
          v-model:address="seedTokens[i].tokenAddress"
          @update:amount="handleAmountChange(token.tokenAddress)"
          :weight="seedTokens[i].weight / 100"
          :name="`initial-token-${seedTokens[i].tokenAddress}`"
          fixedToken
        />
      </BalStack>
      <BalBtn @click="proceed" block color="gradient">Preview</BalBtn>
    </BalStack>
  </BalCard>
</template>
