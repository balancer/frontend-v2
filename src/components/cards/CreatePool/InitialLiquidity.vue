<script setup lang="ts">
import useWeb3 from '@/services/web3/useWeb3';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';

/**
 * COMPOSABLES
 */
const { userNetworkConfig } = useWeb3();
const { tokenWeights, proceed } = usePoolCreation();

// @update:amount="handleInAmountChange"
// @update:address="emit('update:tokenInAddress', $event)"
// :excludedTokens="[_tokenOutAddress]"
</script>

<template>
  <BalCard>
    <BalStack vertical>
      <BalStack vertical spacing="xs">
        <span class="text-sm text-gray-700">{{ userNetworkConfig?.name }}</span>
        <h5 class="font-bold">Set initial liquidity</h5>
      </BalStack>
      <!-- <BalStack isDynamic vertical> -->
        <div>
        <TokenInput
          v-for="(token, i) in tokenWeights"
          :key="token.tokenAddress"
          v-model:amount="tokenWeights[i].amount"
          v-model:address="tokenWeights[i].tokenAddress"
          :weight="tokenWeights[i].weight / 100"
          :name="`initial-token-${tokenWeights[i].tokenAddress}`"
        />
        </div>
      <!-- </BalStack> -->
      <BalBtn @click="proceed" block color="gradient">Preview</BalBtn>
    </BalStack>
  </BalCard>
</template>
