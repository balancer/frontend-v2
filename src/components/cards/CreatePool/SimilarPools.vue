<script lang="ts" setup>
import { computed } from 'vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useWeb3 from '@/services/web3/useWeb3';
import useNumbers from '@/composables/useNumbers';

import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import { useI18n } from 'vue-i18n';
import { orderBy, take } from 'lodash';

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
  resetPoolCreationState,
  goBack
} = usePoolCreation();
const { fNum } = useNumbers();
const { t } = useI18n();

/** COMPUTED */
const title = computed(() => {
  if (existingPool.value) return t('createAPool.poolAlreadyExists');
  return t('createAPool.similarPoolsExist');
});

// limit the similar pools on the UI to the first 4 ones
// with highest tvl
const relevantSimilarPools = computed(() => {
  return take(
    orderBy(similarPools.value, pool => Number(pool.totalLiquidity), 'desc'),
    4
  );
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
      <BalStack vertical spacing="xs">
        <span
          v-if="isWalletReady"
          class="text-xs text-gray-700 dark:text-gray-500"
          >{{ userNetworkConfig?.name }}</span
        >
        <BalStack align="center" horizontal spacing="xs">
          <button
            @click="goBack"
            class="text-blue-500 hover:text-blue-700 flex"
          >
            <BalIcon class="flex" name="chevron-left" />
          </button>
          <h5 class="font-bold dark:text-gray-300">{{ title }}</h5>
        </BalStack>
      </BalStack>
      <p v-if="existingPool">{{ $t('createAPool.existingPoolInfo') }}</p>
      <div v-if="isLoadingSimilarPools"></div>
      <BalCard v-else-if="existingPool" shadow="none">
        <BalStack vertical>
          <BalStack spacing="sm" horizontal align="center">
            <div>
              <BalAssetSet :width="35" :addresses="existingPool.tokensList" />
            </div>
            <TokenPills :tokens="existingPool.tokens" />
          </BalStack>
          <BalStack horizontal spacing="lg">
            <BalStack vertical spacing="none">
              <span class="font-medium  dark:text-gray-500">{{
                $t('poolValue')
              }}</span>
              <span class="font-semibold">{{
                fNum(existingPool.totalLiquidity, 'usd')
              }}</span>
            </BalStack>
            <BalStack vertical spacing="none">
              <span class="font-medium  dark:text-gray-500">{{
                $t('volume24hShort')
              }}</span>
              <span class="font-semibold">{{
                fNum(existingPool.dynamic.volume, 'usd')
              }}</span>
            </BalStack>
            <BalStack vertical spacing="none">
              <span class="font-medium capitalize  dark:text-gray-500">{{
                $t('fees')
              }}</span>
              <span class="font-semibold">{{
                fNum(existingPool.swapFee, 'percent')
              }}</span>
            </BalStack>
          </BalStack>
        </BalStack>
      </BalCard>
      <BalStack isDynamic v-else vertical>
        <BalCard
          shadow="none"
          v-for="pool in relevantSimilarPools"
          :key="pool.id"
        >
          <BalStack vertical>
            <BalStack spacing="sm" horizontal align="center">
              <div>
                <BalAssetSet :width="35" :addresses="pool.tokensList" />
              </div>
              <TokenPills :tokens="pool.tokens" />
            </BalStack>
            <BalStack horizontal spacing="xl">
              <BalStack vertical spacing="none">
                <span class="font-medium  dark:text-gray-500">{{
                  $t('poolValue')
                }}</span>
                <span class="font-semibold">{{
                  fNum(pool.totalLiquidity, 'usd')
                }}</span>
              </BalStack>
              <BalStack vertical spacing="none">
                <span class="font-medium  dark:text-gray-500">{{
                  $t('volume24hShort')
                }}</span>
                <span class="font-semibold">{{
                  fNum(pool.dynamic.volume, 'usd')
                }}</span>
              </BalStack>
              <BalStack vertical spacing="none">
                <span class="font-medium capitalize dark:text-gray-500">{{
                  $t('fees')
                }}</span>
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
