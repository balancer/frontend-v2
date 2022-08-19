<script setup lang="ts">
import { computed } from 'vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useBreakpoints from '@/composables/useBreakpoints';
import useTokens from '@/composables/useTokens';
import useVeBal from '@/composables/useVeBAL';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import HowToLock from './components/HowToLock.vue';
import LockableTokens from './components/LockableTokens.vue';
import MyVeBAL from './components/MyVeBAL.vue';
import VeBalForm from './components/VeBalForm/VeBalForm.vue';

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { isWalletReady } = useWeb3();
const { lockablePoolId } = useVeBal();
const { isDesktop, isMobile } = useBreakpoints();

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
  <Col3Layout offsetGutters>
    <template #gutterLeft>
      <BalLoadingBlock
        v-if="isLoading || !lockablePool || !lockablePoolTokenInfo"
        class="h-36"
      />
      <LockableTokens
        v-else
        :lockablePool="lockablePool"
        :lockablePoolTokenInfo="lockablePoolTokenInfo"
      />
      <template v-if="isDesktop">
        <BalLoadingBlock
          v-if="isLoading || !lockablePool || !lockablePoolTokenInfo"
          class="mt-4 h-12"
        />
        <HowToLock
          v-else
          :lockablePool="lockablePool"
          :lockablePoolTokenInfo="lockablePoolTokenInfo"
        />
      </template>
    </template>

    <BalLoadingBlock
      v-if="isLoading || !lockablePool || !lockablePoolTokenInfo"
      class="h-96"
    />
    <VeBalForm
      v-else
      :lockablePool="lockablePool"
      :lockablePoolTokenInfo="lockablePoolTokenInfo"
      :veBalLockInfo="veBalLockInfo"
    />

    <template #gutterRight>
      <BalLoadingBlock v-if="isLoading" class="h-64" />
      <MyVeBAL v-else :veBalLockInfo="veBalLockInfo" />
      <template v-if="isMobile">
        <BalLoadingBlock
          v-if="isLoading || !lockablePool || !lockablePoolTokenInfo"
          class="mt-4 h-12"
        />
        <HowToLock
          v-else
          :lockablePool="lockablePool"
          :lockablePoolTokenInfo="lockablePoolTokenInfo"
        />
      </template>
    </template>
  </Col3Layout>
</template>
