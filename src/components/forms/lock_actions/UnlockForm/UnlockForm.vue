<script setup lang="ts">
import { computed } from 'vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useTokens from '@/composables/useTokens';
import useVeBal from '@/composables/useVeBAL';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import MyVeBAL from '../LockForm/components/MyVeBAL.vue';
import VeBalUnlockForm from './components/VeBalUnlockForm/VeBalUnlockForm.vue';

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
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

const lockablePool = computed<Pool | undefined>(
  () => lockablePoolQuery.data.value
);

const lockablePoolTokenInfo = computed(() =>
  lockablePool.value != null ? getToken(lockablePool.value.address) : null
);

const veBalLockInfo = computed(() => veBalLockInfoQuery.data.value);

const isLoading = computed(() =>
  isWalletReady.value
    ? lockablePoolLoading.value || veBalQueryLoading.value
    : lockablePoolLoading.value
);
</script>

<template>
  <Col3Layout offset-gutters>
    <BalLoadingBlock v-if="isLoading" class="h-96" />
    <VeBalUnlockForm
      v-else
      :key="
        veBalLockInfo?.hasExistingLock
          ? 'veBalUnlockForm-hasLock'
          : 'veBalUnlockForm-noLock'
      "
      :lockable-pool="lockablePool"
      :lockable-pool-token-info="lockablePoolTokenInfo"
      :ve-bal-lock-info="veBalLockInfo"
    />

    <template #gutterRight>
      <BalLoadingBlock v-if="isLoading" class="h-64" />
      <MyVeBAL v-else :ve-bal-lock-info="veBalLockInfo" />
    </template>
  </Col3Layout>
</template>
