<script setup lang="ts">
import { computed, toRefs } from 'vue';

import usePoolQuery from '@/composables/queries/usePoolQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';

import useTokens from '@/composables/useTokens';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';
import { networkId } from '@/composables/useNetwork';

import { POOLS } from '@/constants/pools';

import { FullPool } from '@/services/balancer/subgraph/types';

import LockableTokens from './components/LockableTokens.vue';
import MyVeBAL from './components/MyVeBAL.vue';
import VeBalForm from './components/VeBalForm.vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';

/**
 * COMPOSABLES
 */
const { tokens, dynamicDataLoading } = useTokens();

const lockablePoolAddress = computed(
  () => POOLS.IdsMap[networkId.value]?.['B-80BAL-20WETH']
);

/**
 * QUERIES
 */
const lockablePoolQuery = usePoolQuery(lockablePoolAddress.value as string);
const veBalLockInfoQuery = useVeBalLockInfoQuery();
const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

const { loading: batchRelayerApprovalLoading } = toRefs(batchRelayerApproval);

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

const lockableTokenInfo = computed(() =>
  lockablePool.value != null ? tokens.value[lockablePool.value.address] : null
);

const veBalLockInfo = computed(() => veBalLockInfoQuery.data.value);

const isLoading = computed(
  () =>
    lockablePoolLoading.value ||
    batchRelayerApprovalLoading.value ||
    dynamicDataLoading.value ||
    veBalQueryLoading.value
);
</script>

<template>
  <Col3Layout offsetGutters>
    <template #gutterLeft>
      <BalLoadingBlock v-if="isLoading" class="h-36" />
      <LockableTokens
        v-else
        :lockablePool="lockablePool"
        :lockableTokenInfo="lockableTokenInfo"
      />
    </template>

    <BalLoadingBlock v-if="isLoading" class="h-96" />
    <VeBalForm
      v-else
      :lockablePool="lockablePool"
      :lockableTokenInfo="lockableTokenInfo"
      :veBalLockInfo="veBalLockInfo"
    />

    <template #gutterRight>
      <BalLoadingBlock v-if="isLoading" class="h-64" />
      <MyVeBAL v-else />
    </template>
  </Col3Layout>
</template>
