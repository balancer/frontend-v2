<script setup lang="ts">
import { computed } from 'vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import { useTokens } from '@/providers/tokens.provider';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import MyVeBAL from '../LockForm/components/MyVeBAL.vue';
import VeBalUnlockForm from './components/VeBalUnlockForm/VeBalUnlockForm.vue';
import { staticLockPool } from '@/composables/useLock';

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { isWalletReady } = useWeb3();
// const { lockablePoolId } = useVeBal();

/**
 * QUERIES
 */
// const lockablePoolQuery = usePoolQuery(lockablePoolId.value as string);
const veBalLockInfoQuery = useVeBalLockInfoQuery();

/**
 * COMPUTED
 */
const lockablePoolLoading = computed(() => false);

const veBalQueryLoading = computed(() => veBalLockInfoQuery.isLoading.value);

const lockablePool = computed<Pool | undefined>(() => staticLockPool);

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
  <Col3Layout offsetGutters>
    <BalLoadingBlock
      v-if="
        isLoading || !veBalLockInfo || !lockablePool || !lockablePoolTokenInfo
      "
      class="h-96"
    />
    <VeBalUnlockForm
      v-else
      :key="
        veBalLockInfo?.hasExistingLock
          ? 'veBalUnlockForm-hasLock'
          : 'veBalUnlockForm-noLock'
      "
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :veBalLockInfo="veBalLockInfo"
    />

    <template #gutterRight>
      <BalLoadingBlock v-if="isLoading" class="h-64" />
      <MyVeBAL v-else :veBalLockInfo="veBalLockInfo" />
    </template>
  </Col3Layout>
</template>
