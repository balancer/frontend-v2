<script setup lang="ts">
import useNetwork from '@/composables/useNetwork';
import { deprecatedDetails } from '@/composables/usePool';
import NewPoolData from './NewPoolData.vue';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import GradientCard from '@/components/cards/GradientCard/GradientCard.vue';

/**
 * TYPES
 */
type Props = {
  poolId: string;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { networkSlug } = useNetwork();

const poolDeprecatedDetails = computed(() => deprecatedDetails(props.poolId));

let newPoolQuery;
if (poolDeprecatedDetails.value?.newPool) {
  newPoolQuery = usePoolQuery(poolDeprecatedDetails.value?.newPool);
}

let suggestedPoolsQuery;
if (poolDeprecatedDetails.value?.suggestedPools?.length) {
  suggestedPoolsQuery = usePoolsQuery(
    ref([]),
    {},
    {
      poolIds: ref(poolDeprecatedDetails.value.suggestedPools),
      first: 1000,
    }
  );
}

/**
 * COMPUTED
 */
const loadingNewPool = computed(
  () => newPoolQuery && newPoolQuery.isLoading.value
);
const newPool = computed(() => {
  if (!newPoolQuery) {
    return;
  }
  return newPoolQuery.data.value;
});

const loadingSuggestedPools = computed(
  () => suggestedPoolsQuery && suggestedPoolsQuery.isLoading.value
);
const suggestedPools = computed(() => {
  if (!suggestedPoolsQuery) {
    return;
  }
  return suggestedPoolsQuery.data.value?.pages?.[0].pools;
});
</script>

<template>
  <BalLoadingBlock
    v-if="loadingSuggestedPools || loadingNewPool"
    class="mb-4 h-60 pool-actions-card"
  />
  <BalStack v-else vertical>
    <GradientCard
      :imgUrls="[
        '/images/migration/migration-bg.jpg',
        '/images/migration/migration-bg.avif',
      ]"
    >
      <div class="flex flex-col items-center text-white">
        <div class="px-6 pt-7 pb-4">
          <div class="mb-4 text-3xl font-bold text-opacity-90">
            {{ $t('migrateCard.title') }}
          </div>
          <div class="mb-3 text-sm text-opacity-80">
            {{ $t('migrateCard.description') }}
          </div>
          <div v-if="newPool">
            <div class="mb-4 font-bold">
              {{ $t('migrateCard.upgradedPool') }}
            </div>
            <NewPoolData :pool="newPool" />
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
            color="transparent"
            outline
            :label="$t('migrateCard.viewBtn')"
            @click="$router.push({ name: 'vebal', params: { networkSlug } })"
          />
        </div>
      </div>
    </GradientCard>
  </BalStack>
</template>