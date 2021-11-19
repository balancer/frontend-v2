<script setup lang="ts">
import { onMounted } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolCreation from '@/composables/pools/usePoolCreation';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';

/**
 * COMPOSABLES
 */
const { userNetworkConfig } = useWeb3();
const { tokenWeights, proceed, optimisedLiquidity, goBack } = usePoolCreation();

onMounted(() => {
  for (const token of tokenWeights.value) {
    token.amount = optimisedLiquidity.value[token.tokenAddress].balanceRequired;
  }
});
</script>

<template>
  <BalCard>
    <BalStack vertical>
      <BalStack vertical spacing="xs">
        <span class="text-sm text-gray-700">{{ userNetworkConfig?.name }}</span>
        <BalStack horizontal spacing="xs" align="center">
          <button
            @click="goBack"
            class="text-blue-500 hover:text-blue-700 flex"
          >
            <BalIcon class="flex" name="chevron-left" />
          </button>

          <h5 class="font-bold">Set initial liquidity</h5>
        </BalStack>
      </BalStack>
      <BalStack isDynamic vertical>
        <TokenInput
          v-for="(token, i) in tokenWeights"
          :key="token.tokenAddress"
          v-model:amount="tokenWeights[i].amount"
          v-model:address="tokenWeights[i].tokenAddress"
          :weight="tokenWeights[i].weight / 100"
          :name="`initial-token-${tokenWeights[i].tokenAddress}`"
        />
      </BalStack>
      <BalBtn @click="proceed" block color="gradient">Preview</BalBtn>
    </BalStack>
  </BalCard>
</template>
