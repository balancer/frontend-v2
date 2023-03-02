<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import useNetwork from '@/composables/useNetwork';
import { deprecatedDetails } from '@/composables/usePool';
import NewPoolData from './NewPoolData.vue';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { networkSlug } = useNetwork();
const router = useRouter();

const poolDeprecatedDetails = computed(() => deprecatedDetails(props.pool.id));

let suggestedPoolsQuery;
console.log(poolDeprecatedDetails.value?.suggestedPools);
if (poolDeprecatedDetails.value?.suggestedPools?.length) {
  suggestedPoolsQuery = usePoolsQuery(
    ref([]),
    {},
    {
      poolIds: ref(poolDeprecatedDetails.value.suggestedPools),
    }
  );
}

/**
 * COMPUTED
 */
const loadingSuggestedPools = computed(
  () => suggestedPoolsQuery && suggestedPoolsQuery.isLoading.value
);
const suggestedPools = computed(() => {
  if (!suggestedPoolsQuery) {
    return;
  }
  return suggestedPoolsQuery.data.value?.pages?.[0].pools;
});

const newPoolId = computed(
  (): string | undefined => deprecatedDetails(props.pool.id)?.newPool
);

const poolRoute = computed(() => {
  if (!newPoolId.value) return undefined;

  return router.resolve({
    name: 'pool',
    params: { id: newPoolId.value, networkSlug },
  }).fullPath;
});
</script>

<template>
  <BalLoadingBlock
    v-if="loadingSuggestedPools"
    class="mb-4 h-60 pool-actions-card"
  />
  <BalStack v-else vertical>
    <BalCard shadow="2xl" noPad class="rounded-xl migration-card" growContent>
      <div class="flex flex-col items-center text-white">
        <div class="px-6 pt-7 pb-4">
          <div class="mb-4 text-3xl font-bold text-opacity-90">
            {{ $t('migrateCard.title') }}
          </div>
          <div class="mb-3 text-sm text-opacity-80">
            {{ $t('migrateCard.description') }}
          </div>
          <div v-if="false">
            <div class="mb-4 font-bold">
              {{ $t('migrateCard.upgradedPool') }}
            </div>
            <NewPoolData :pool="pool" />
          </div>
          <div v-else-if="suggestedPools">
            <div class="mb-4 font-bold">
              {{ $t('migrateCard.recommendedPool') }}
            </div>
            <div class="flex flex-col">
              <NewPoolData
                v-for="sPool in suggestedPools"
                :key="sPool.id"
                :pool="sPool"
              />
            </div>
          </div>
          <BalBtn
            v-else
            color="blue"
            :label="$t('migrateCard.viewBtn')"
            block
            @click="$router.push({ name: 'vebal', params: { networkSlug } })"
          />
        </div>
      </div>
    </BalCard>
  </BalStack>
</template>

<style>
.migration-card {
  background-image: url('/images/migration/migration-bg.avif'),
    url('/images/migration/migration-bg.jpg');
}
</style>