<script lang="ts" setup>
import { computed } from 'vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useWeb3 from '@/services/web3/useWeb3';
import useNumbers from '@/composables/useNumbers';

import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';

/**
 * COMPOSABLES
 */
const { userNetworkConfig, isWalletReady } = useWeb3();
const {
  similarPools,
  isLoadingSimilarPools,
  existingPool,
  setStep,
  proceed,
  resetPoolCreationState
} = usePoolCreation();
const { fNum } = useNumbers();

/** COMPUTED */
const title = computed(() => {
  if (existingPool.value) return 'This pool already exists';
  return 'Similar pools exist';
});

/**
 * FUNCTIONS
 */
function cancel() {
  resetPoolCreationState();
  setStep(0);
}
</script>

<template>
  <BalCard :class="{ 'border-red-400': existingPool }">
    <BalStack vertical>
      <span v-if="isWalletReady" class="text-sm text-gray-700">{{
        userNetworkConfig?.name
      }}</span>
      <h5 class="font-bold">{{ title }}</h5>
      <p v-if="existingPool">
        There’s already another pool with exactly the same tokens and fee
        structure. It’s recommended to add your liquidity to the other pool or
        to go back and change your Pool Creation parameters in a material way to
        avoid fractured liquidity and lower profits for both pools.
      </p>
      <div v-if="isLoadingSimilarPools">my name jeff</div>
      <BalCard v-else-if="existingPool" shadow="false">
        <BalStack vertical>
          <BalStack spacing="sm" horizontal align="center">
            <BalAssetSet :width="35" :addresses="existingPool.tokensList" />
            <TokenPills :tokens="existingPool.tokens" />
          </BalStack>
          <BalStack horizontal spacing="lg">
            <BalStack vertical spacing="none">
              <span class="font-medium">Pool value</span>
              <span class="font-semibold">{{
                fNum(existingPool.totalLiquidity, 'usd')
              }}</span>
            </BalStack>
            <BalStack vertical spacing="none">
              <span class="font-medium">Vol (24h)</span>
              <span class="font-semibold">{{
                fNum(existingPool.dynamic.volume, 'usd')
              }}</span>
            </BalStack>
            <BalStack vertical spacing="none">
              <span class="font-medium">Fees</span>
              <span class="font-semibold">{{
                fNum(existingPool.swapFee, 'percent')
              }}</span>
            </BalStack>
          </BalStack>
        </BalStack>
      </BalCard>
      <BalStack isDynamic v-else vertical>
        <BalCard shadow="false" v-for="pool in similarPools" :key="pool.id">
          <BalStack vertical>
            <BalStack spacing="sm" horizontal align="center">
              <BalAssetSet :width="35" :addresses="pool.tokensList" />
              <TokenPills :tokens="pool.tokens" />
            </BalStack>
            <BalStack horizontal spacing="xl">
              <BalStack vertical spacing="none">
                <span class="font-medium">Pool value</span>
                <span class="font-semibold">{{
                  fNum(pool.totalLiquidity, 'usd')
                }}</span>
              </BalStack>
              <BalStack vertical spacing="none">
                <span class="font-medium">Vol (24h)</span>
                <span class="font-semibold">{{
                  fNum(pool.dynamic.volume, 'usd')
                }}</span>
              </BalStack>
              <BalStack vertical spacing="none">
                <span class="font-medium">Fees</span>
                <span class="font-semibold">{{
                  fNum(pool.swapFee, 'percent')
                }}</span>
              </BalStack>
            </BalStack>
          </BalStack>
        </BalCard>
      </BalStack>
      <BalAlert
        v-if="!existingPool"
        block
        type="warning"
        title="Are you sure you want to continue?"
      >
        You can continue to create your pool anyway, but you’ll have to pay pool
        creation gas costs and liquidity will be fractured which is likely to
        result in your new pool being less profitable.
      </BalAlert>
      <BalStack horizontal expandChildren>
        <BalBtn @click="cancel" block outline>Cancel</BalBtn>
        <BalBtn @click="proceed" v-if="!existingPool" block color="gradient"
          >Continue anyway</BalBtn
        >
      </BalStack>
    </BalStack>
  </BalCard>
</template>
