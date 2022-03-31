<script setup lang="ts">
import { computed } from 'vue';

import usePoolQuery from '@/composables/queries/usePoolQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useVeBal from '@/composables/useVeBAL';
import useTokens from '@/composables/useTokens';

import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';

import MyVeBAL from '../LockForm/components/MyVeBAL.vue';
import VeBalUnlockForm from './components/VeBalUnlockForm/VeBalUnlockForm.vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';

/**
 * COMPOSABLES
 */
const { tokens } = useTokens();
const { isWalletReady } = useWeb3();
const { lockablePoolId } = useVeBal();

/**
 * QUERIES
 */
const lockablePoolQuery = usePoolQuery(lockablePoolId.value as string);
const veBalLockInfoQuery = useVeBalLockInfoQuery();

/**
 * COMPUTED
 */
const lockablePoolLoading = computed(
  () => lockablePoolQuery.isLoading.value || lockablePoolQuery.isIdle.value
);

const veBalQueryLoading = computed(
  () => veBalLockInfoQuery.isLoading.value || veBalLockInfoQuery.isIdle.value
);

const lockablePool = computed<FullPool | undefined>(
  () => lockablePoolQuery.data.value
);

const lockablePoolTokenInfo = computed(() =>
  lockablePool.value != null ? tokens.value[lockablePool.value.address] : null
);

const veBalLockInfo = computed(() => veBalLockInfoQuery.data.value);

const isLoading = computed(() =>
  isWalletReady.value
    ? lockablePoolLoading.value || veBalQueryLoading.value
    : lockablePoolLoading.value
);
</script>

<template>
  <Col3Layout offsetGutters>
    <BalLoadingBlock v-if="isLoading" class="h-96" />
    <VeBalUnlockForm
      v-else
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :veBalLockInfo="veBalLockInfo"
      :key="
        veBalLockInfo?.hasExistingLock
          ? 'veBalUnlockForm-hasLock'
          : 'veBalUnlockForm-noLock'
      "
    />

    <template #gutterRight>
      <BalLoadingBlock v-if="isLoading" class="h-64" />
      <MyVeBAL v-else :veBalLockInfo="veBalLockInfo" />
    </template>
  </Col3Layout>
</template>
