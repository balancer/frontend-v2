<script setup lang="ts">
import useMetadatasQuery from '@/composables/queries/useMetadatasQuery';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import { poolMetadataCustomName } from '@/lib/config/metadata';
import { Pool } from '@balancer-labs/sdk';
import { isStableLike, orderedPoolTokens } from '@/composables/usePoolHelpers';

type Props = {
  poolIds: string[];
  selectedTokens?: string[];
  pool: Pool;
};

const props = withDefaults(defineProps<Props>(), {
  poolIds: () => [],
});

const poolsMetadataQuery = useMetadatasQuery(props.poolIds);

const customName = computed(
  () =>
    poolsMetadataQuery.data.value
      ?.find(pool => pool.poolId.toLowerCase() === props.pool.id.toLowerCase())
      ?.metadata.filter(metadata => metadata.key === 'name')[0].value
);
</script>

<template>
  <div v-if="poolMetadataCustomName(props.pool.id, customName)">
    {{ poolMetadataCustomName(props.pool.id, customName) }}
  </div>
  <div v-else>
    <TokenPills
      :tokens="orderedPoolTokens(pool, pool.tokens)"
      :isStablePool="isStableLike(pool.poolType)"
      :selectedTokens="selectedTokens"
      :pickedTokens="selectedTokens"
    />
  </div>
</template>