<script lang="ts" setup>
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import useNumbers from '@/composables/useNumbers';

/**
 * COMPOSABLES
 */
const { userNetworkConfig } = useWeb3();
const { tokenWeights, totalLiquidity } = usePoolCreation();
const { tokens, priceFor } = useTokens();
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
</script>

<template>
  <BalCard>
    <BalStack vertical>
      <BalStack vertical spacing="xs">
        <span class="text-sm text-gray-700">{{ userNetworkConfig?.name }}</span>
        <h5 class="font-bold">Preview new weighted pool</h5>
      </BalStack>
      <BalStack horizontal spacing="sm" isDynamic>
        <div
          v-for="token in tokenWeights"
          :key="`tokenchip-${token.tokenAddress}`"
          class="rounded-lg shadow-lg p-2"
        >
          <BalStack horizontal spacing="xs" align="center">
            <BalAsset :address="token.tokenAddress" :size="24" />
            <span class="text-lg font-medium">{{
              tokens[token.tokenAddress].symbol
            }}</span>
            <span class="">{{ fNum(token.weight / 100, 'percent') }}</span>
          </BalStack>
        </div>
      </BalStack>
      <BalCard shadow="false" noPad>
        <div class="bg-gray-50 p-2">
          <h6>Tokens and initial seed liquidity</h6>
        </div>
        <BalStack vertical spacing="none" withBorder isDynamic>
          <div
            v-for="token in tokenWeights"
            :key="`tokenpreview-${token.tokenAddress}`"
            class="p-4"
          >
            <BalStack horizontal justify="between">
              <BalStack horizontal align="center">
                <BalAsset :address="token.tokenAddress" size="36" />
                <BalStack vertical spacing="none">
                  <span class=" font-semibold"
                    >{{ fNum(token.weight / 100, 'percent') }}
                    {{ tokens[token.tokenAddress].symbol }}</span
                  >
                  <span class="text-sm text-gray-500">Initial weight: ??</span>
                </BalStack>
              </BalStack>
              <BalStack vertical spacing="none" align="end">
                <span class="font-semibold">{{
                  fNum(token.amount, 'token')
                }}</span>
                <span class="text-sm text-gray-500">{{
                  fNum(token.amount * priceFor(token.tokenAddress), 'usd')
                }}</span>
              </BalStack>
            </BalStack>
          </div>
        </BalStack>
        <BalStack horizontal justify="between" class="p-4 border-t">
          <h6>Total</h6>
          <h6>{{ fNum(totalLiquidity, 'usd') }}</h6>
        </BalStack>
        <!-- <BalHorizSteps
          :steps="steps"
          class="flex justify-center"
        /> -->
        <BalBtn color="gradient">Create pool</BalBtn>
      </BalCard>
    </BalStack>
  </BalCard>
</template>
