<script setup lang="ts">
import useMetadatasQuery from '@/composables/queries/useMetadatasQuery';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import { poolMetadataCustomName } from '@/lib/config/metadata';
import { PoolToken } from '@balancer-labs/sdk';

type Props = {
  poolIds: string[];
  poolId: string;
  tokens: PoolToken[];
  isStablePool?: boolean;
  selectedTokens?: string[];
};

const props = withDefaults(defineProps<Props>(), {
  poolIds: () => [],
});

const poolsMetadataQuery = useMetadatasQuery(props.poolIds);

const customName = computed(
  () =>
    poolsMetadataQuery.data.value
      ?.find(pool => pool.poolId.toLowerCase() === props.poolId.toLowerCase())
      ?.metadata.filter(metadata => metadata.key === 'name')[0].value
);
</script>

<template>
  <div v-if="poolMetadataCustomName(props.poolId, customName)">
    {{ poolMetadataCustomName(props.poolId, customName) }}
  </div>
  <div v-else>
    <TokenPills
      :tokens="tokens"
      :isStablePool="isStablePool"
      :selectedTokens="selectedTokens"
      :pickedTokens="selectedTokens"
    />
  </div>
</template>