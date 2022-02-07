<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onBeforeMount, toRefs } from 'vue';

import LockableTokens from './components/LockableTokens.vue';
import VeBalForm from './components/VeBalForm.vue';
import MyVeBAL from './components/MyVeBAL.vue';

import useVeBAL from '@/composables/useVeBAL';
import useTokens from '@/composables/useTokens';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';
import { POOLS } from '@/constants/pools';
import { networkId } from '@/composables/useNetwork';

/**
 * COMPOSABLES
 */

const router = useRouter();
const { isVeBalSupported } = useVeBAL();
const { tokens } = useTokens();

const poolAddress = computed(
  () => POOLS.IdsMap[networkId.value]?.['B-80BAL-20WETH']
);

/**
 * QUERIES
 */
const poolQuery = usePoolQuery(poolAddress.value as string);
const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

const { loading: batchRelayerApprovalLoading } = toRefs(batchRelayerApproval);

/**
 * COMPUTED
 */
const poolLoading = computed(
  () => poolQuery.isLoading.value || poolQuery.isIdle.value
);

const pool = computed(() => poolQuery.data.value);

const isLoading = computed(
  () => poolLoading.value || batchRelayerApprovalLoading.value
);

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  if (!isVeBalSupported.value) {
    router.push({ name: 'home' });
  }
});
</script>

<template>
  <Col3Layout offsetGutters>
    <template #gutterLeft>
      <LockableTokens />
    </template>

    <!-- <LockForm /> -->

    <template #gutterRight>
      <MyVeBAL />
    </template>
  </Col3Layout>
</template>
