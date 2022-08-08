<script lang="ts" setup>
import { orderBy, take } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';

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
  goBack,
} = usePoolCreation();
const { fNum2 } = useNumbers();
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
  <BalCard shadow="xl" noBorder :class="{ 'border-red-400': existingPool }">
    <BalStack vertical>
      <BalStack vertical spacing="xs">
        <span
          v-if="isWalletReady"
          class="text-xs text-gray-600 dark:text-gray-400"
          >{{ userNetworkConfig?.name }}</span
        >
        <BalStack align="center" horizontal spacing="xs">
          <button
            class="flex text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            @click="goBack"
          >
            <BalIcon class="flex" name="chevron-left" />
          </button>
          <h5 class="font-semibold dark:text-gray-300">
            {{ title }}
          </h5>
        </BalStack>
      </BalStack>
      <p v-if="existingPool">
        {{ $t('createAPool.existingPoolInfo') }}
      </p>
      <div v-if="isLoadingSimilarPools" />
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
              <span class="font-medium text-secondary">{{
                $t('poolValue')
              }}</span>
              <span class="font-semibold">{{
                fNum2(existingPool.totalLiquidity, FNumFormats.fiat)
              }}</span>
            </BalStack>
            <BalStack vertical spacing="none">
              <span class="font-medium text-secondary">{{
                $t('volume24hShort')
              }}</span>
              <span class="font-semibold">{{
                fNum2(existingPool?.volumeSnapshot || '0', FNumFormats.fiat)
              }}</span>
            </BalStack>
            <BalStack vertical spacing="none">
              <span class="font-medium capitalize text-secondary">{{
                $t('fees')
              }}</span>
              <span class="font-semibold">{{
                fNum2(existingPool.swapFee, FNumFormats.percent)
              }}</span>
            </BalStack>
          </BalStack>
        </BalStack>
      </BalCard>
      <BalStack v-else vertical>
        <BalCard
          v-for="pool in relevantSimilarPools"
          :key="pool.id"
          shadow="none"
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
                <span class="font-medium text-secondary">{{
                  $t('poolValue')
                }}</span>
                <span class="font-semibold">{{
                  fNum2(pool.totalLiquidity, FNumFormats.fiat)
                }}</span>
              </BalStack>
              <BalStack vertical spacing="none">
                <span class="font-medium text-secondary">{{
                  $t('volume24hShort')
                }}</span>
                <span class="font-semibold">{{
                  fNum2(pool?.volumeSnapshot || '0', FNumFormats.fiat)
                }}</span>
              </BalStack>
              <BalStack vertical spacing="none">
                <span class="font-medium capitalize text-secondary">{{
                  $t('fees')
                }}</span>
                <span class="font-semibold">{{
                  fNum2(pool.swapFee, FNumFormats.percent)
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
        <BalBtn block outline color="black" @click="cancel">
          {{ $t('cancel') }}
        </BalBtn>
        <BalBtn v-if="!existingPool" block color="gradient" @click="proceed">
          Continue anyway
        </BalBtn>
      </BalStack>
    </BalStack>
  </BalCard>
</template>
