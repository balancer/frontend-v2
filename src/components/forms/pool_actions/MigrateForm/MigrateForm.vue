<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';

import Col3Layout from '@/components/layouts/Col3Layout.vue';
import useRelayerApproval, {
  Relayer,
} from '@/composables/trade/useRelayerApproval';
import useTokens from '@/composables/useTokens';
import StakingProvider from '@/providers/local/staking/staking.provider';
import { Pool } from '@/services/pool/types';

import MigrateExplainer from './components/MigrateExplainer.vue';
import PoolsInfo from './components/PoolsInfo/PoolsInfo.vue';
import PoolStats from './components/PoolStats.vue';
import { PoolMigrationInfo } from './types';
import useApp from '@/composables/useApp';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';

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
const { getToken } = useTokens();
const { appLoading } = useApp();

/**
 * QUERIES
 */
const { data: poolsResponse, isLoading: isLoadingPools } = usePoolsQuery(
  ref([]),
  {},
  {
    poolIds: ref([
      props.poolMigrationInfo.fromPoolId,
      props.poolMigrationInfo.toPoolId,
    ]),
  }
);

const poolsData = computed(() => poolsResponse.value?.pages?.[0].pools);

const batchRelayerApproval = useRelayerApproval(Relayer.BATCH);

const { loading: batchRelayerApprovalLoading } = toRefs(batchRelayerApproval);

/**
 * COMPUTED
 */
const fromPool = computed<Pool | undefined>(() =>
  poolsData.value?.find(pool => pool.id === props.poolMigrationInfo.fromPoolId)
);

const toPool = computed<Pool | undefined>(() =>
  poolsData.value?.find(pool => pool.id === props.poolMigrationInfo.toPoolId)
);

const fromPoolTokenInfo = computed(() =>
  fromPool.value != null ? getToken(fromPool.value.address) : null
);

const toPoolTokenInfo = computed(() =>
  toPool.value != null ? getToken(toPool.value.address) : null
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
        !fromPool ||
        !toPool ||
        fromPoolTokenInfo == null ||
        toPoolTokenInfo == null ||
        batchRelayerApprovalLoading ||
        appLoading
      "
      class="h-96"
    />
    <StakingProvider v-else :poolAddress="fromPool!.address">
      <PoolsInfo
        :fromPool="fromPool"
        :toPool="toPool"
        :fromPoolTokenInfo="fromPoolTokenInfo"
        :toPoolTokenInfo="toPoolTokenInfo"
        :poolMigrationInfo="poolMigrationInfo"
      />
    </StakingProvider>

    <template #gutterRight>
      <BalLoadingBlock v-if="isLoadingPools || !toPool" class="h-64" />
      <PoolStats v-else :pool="toPool" :poolMigrationInfo="poolMigrationInfo" />
    </template>
  </Col3Layout>
</template>
