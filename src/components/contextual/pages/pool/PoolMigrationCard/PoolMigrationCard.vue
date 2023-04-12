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

const newPoolQueryEnabled = computed(
  (): boolean => !!poolDeprecatedDetails.value?.newPool
);

const newPoolQuery = usePoolQuery(
  poolDeprecatedDetails.value?.newPool as string,
  newPoolQueryEnabled
);

const suggestPoolsQueryEnabled = computed(() => {
  return !!poolDeprecatedDetails.value?.suggestedPools?.length;
});

const suggestedPoolsQuery = usePoolsQuery(
  ref([]),
  { enabled: suggestPoolsQueryEnabled },
  {
    poolIds: ref(poolDeprecatedDetails.value?.suggestedPools as string[]),
    first: 1000,
  }
);

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

const showLoadingBlock = computed(() => {
  return (
    (newPoolQueryEnabled.value && loadingNewPool.value) ||
    (suggestPoolsQueryEnabled.value && loadingSuggestedPools.value)
  );
});
</script>

<template>
  <BalLoadingBlock
    v-if="showLoadingBlock"
    class="mb-4 h-60 pool-actions-card"
  />
  <BalStack v-else vertical>
    <GradientCard>
      <div class="flex flex-col items-center text-white">
        <div class="container pt-5">
          <div class="mb-2 text-3xl font-bold text-opacity-90">
            {{ $t('migrateCard.title') }}
          </div>
          <div class="mb-3 text-sm font-medium text-opacity-80">
            {{ $t('migrateCard.description') }}
          </div>
          <div v-if="newPool" class="no-pad">
            <div
              class="pb-3 mx-5 font-bold border-b border-gray-300 border-opacity-25 no-pad pools"
            >
              {{ $t('migrateCard.upgradedPool') }}
            </div>
            <NewPoolData :pool="newPool" />
          </div>
          <div v-else-if="suggestedPools" class="no-pad">
            <div
              class="pb-3 mx-5 font-bold border-b border-gray-300 border-opacity-25 no-pad"
            >
              {{ $t('migrateCard.recommendedPool') }}
            </div>
            <div class="no-pad">
              <NewPoolData
                v-for="sPool in suggestedPools"
                :key="sPool.id"
                :pool="sPool"
              />
            </div>
          </div>
          <div v-else class="flex py-3">
            <BalBtn
              class="flex-grow hover:!text-white"
              color="transparent"
              outline
              :label="$t('migrateCard.viewBtn')"
              @click="$router.push({ name: 'vebal', params: { networkSlug } })"
            />
          </div>
        </div>
      </div>
    </GradientCard>
  </BalStack>
</template>
<style scoped>
.container *:not(.no-pad) {
  @apply px-5;
}
</style>