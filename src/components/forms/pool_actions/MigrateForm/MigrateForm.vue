<script setup lang="ts">
import { computed, toRefs } from 'vue';

import { FullPool } from '@/services/balancer/subgraph/types';

import usePoolQuery from '@/composables/queries/usePoolQuery';
import useTokens from '@/composables/useTokens';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';

import Col3Layout from '@/components/layouts/Col3Layout.vue';

import MigrateExplainer from './components/MigrateExplainer.vue';
import PoolsInfo from './components/PoolsInfo/PoolsInfo.vue';
import PoolStats from './components/PoolStats.vue';

import { PoolMigrationInfo } from './types';

type Props = {
  poolMigrationInfo: PoolMigrationInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { tokens } = useTokens();

/**
 * QUERIES
 */
const fromPoolQuery = usePoolQuery(props.poolMigrationInfo.fromPoolId);
const toPoolQuery = usePoolQuery(props.poolMigrationInfo.toPoolId);
const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

const { loading: batchRelayerApprovalLoading } = toRefs(batchRelayerApproval);

/**
 * COMPUTED
 */
const fromPoolLoading = computed(
  () => fromPoolQuery.isLoading.value || fromPoolQuery.isIdle.value
);

const toPoolLoading = computed(
  () => toPoolQuery.isLoading.value || toPoolQuery.isIdle.value
);

const isLoadingPools = computed(
  () => toPoolLoading.value || fromPoolLoading.value
);

const fromPool = computed<FullPool | undefined>(() => fromPoolQuery.data.value);

const toPool = computed<FullPool | undefined>(() => toPoolQuery.data.value);

const fromPoolTokenInfo = computed(() =>
  fromPool.value != null ? tokens.value[fromPool.value.address] : null
);

const toPoolTokenInfo = computed(() =>
  toPool.value != null ? tokens.value[toPool.value.address] : null
);
</script>

<template>
  <Col3Layout offsetGutters>
    <template #gutterLeft>
      <MigrateExplainer :poolMigrationInfo="poolMigrationInfo" />
    </template>

    <BalLoadingBlock
      v-if="
        isLoadingPools ||
          fromPoolTokenInfo == null ||
          toPoolTokenInfo == null ||
          batchRelayerApprovalLoading
      "
      class="h-96"
    />
    <PoolsInfo
      v-else
      :fromPool="fromPool"
      :toPool="toPool"
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
      :poolMigrationInfo="poolMigrationInfo"
    />

    <template #gutterRight>
      <BalLoadingBlock v-if="toPoolLoading" class="h-64" />
      <PoolStats v-else :pool="toPool" :poolMigrationInfo="poolMigrationInfo" />
    </template>
  </Col3Layout>
</template>
