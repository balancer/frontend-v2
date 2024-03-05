<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  PoolChart,
  PoolStatCards,
  PoolTransactionsCard,
  MyPoolBalancesCard,
  PoolCompositionCard,
  PoolContractDetails,
} from '@/components/contextual/pages/pool';
import StakingIncentivesCard from '@/components/contextual/pages/pool/staking/StakingIncentivesCard.vue';
import PoolLockingCard from '@/components/contextual/pages/pool/PoolLockingCard/PoolLockingCard.vue';
import ApyVisionPoolLink from '@/components/links/ApyVisionPoolLink.vue';
import PoolPageHeader from '@/components/pool/PoolPageHeader.vue';
import usePoolAprQuery from '@/composables/queries/usePoolAprQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import {
  isVeBalPool,
  preMintedBptIndex,
  usePoolHelpers,
  tokensListExclBpt,
  tokenTreeLeafs,
  orderedPoolTokens,
} from '@/composables/usePoolHelpers';
import { useTokens } from '@/providers/tokens.provider';
import { POOLS } from '@/constants/pools';
import { includesAddress } from '@/lib/utils';
// import useHistoricalPricesQuery from '@/composables/queries/useHistoricalPricesQuery';
import { PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import BrandedRedirectCard from '@/components/pool/branded-redirect/BrandedRedirectCard.vue';
import metaService from '@/services/meta/meta.service';
import PoolMigrationCard from '@/components/contextual/pages/pool/PoolMigrationCard/PoolMigrationCard.vue';
import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal.vue';
import PoolRisks from '@/components/contextual/pages/pool/risks/PoolRisks.vue';
import { usePool } from '@/providers/local/pool.provider';
import { provideUserStaking } from '@/providers/local/user-staking.provider';
import { providerUserPools } from '@/providers/local/user-pools.provider';
import PointsBanner from '@/components/banners/PointsBanner.vue';

const userStaking = provideUserStaking();
providerUserPools(userStaking);

/**
 * STATE
 */
const route = useRoute();
const router = useRouter();
const poolId = (route.params.id as string).toLowerCase();
const isRestakePreviewVisible = ref(false);

/**
 * COMPOSABLES
 */
const { prices, priceQueryLoading } = useTokens();
const { isWalletReady } = useWeb3();
const _isVeBalPool = isVeBalPool(poolId);
const { pool, isLoadingPool } = usePool();
const {
  isStableLikePool,
  isLiquidityBootstrappingPool,
  isComposableStableLikePool,
  isDeprecatedPool,
  isNewPoolAvailable,
} = usePoolHelpers(pool);

/**
 * COMPUTED
 */
const loadingPool = computed(() => isLoadingPool.value || !pool.value);

//#region pool snapshot query
const poolSnapshotsQuery = usePoolSnapshotsQuery(poolId, undefined, {
  refetchOnWindowFocus: false,
});
const isLoadingSnapshots = computed(() => poolSnapshotsQuery.isLoading.value);

const snapshots = computed(() => poolSnapshotsQuery.data.value);
//#endregion

//#region historical prices query
// const historicalPricesQuery = useHistoricalPricesQuery(
//   poolId,
//   undefined,
//   // in order to prevent multiple coingecko requests
//   { refetchOnWindowFocus: false }
// );
// const historicalPrices = computed(() => historicalPricesQuery.data.value);
//#endregion

//#region APR query
const aprQuery = usePoolAprQuery(poolId);
const loadingApr = computed(
  () => aprQuery.isLoading.value || Boolean(aprQuery.error.value)
);
const poolApr = computed(() => aprQuery.data.value);
//#endregion

//#region Intersection Observer
const intersectionSentinel = ref<HTMLDivElement | null>(null);
const isSentinelIntersected = ref(false);
let observer: IntersectionObserver | undefined;

function addIntersectionObserver(): void {
  if (
    !('IntersectionObserver' in window) ||
    !('IntersectionObserverEntry' in window) ||
    !intersectionSentinel.value
  ) {
    isSentinelIntersected.value = true;
    return;
  }

  const options = {
    rootMargin: '-100px',
  };

  const callback = (entries: IntersectionObserverEntry[]): void => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isSentinelIntersected.value = true;
      }
    });
  };
  observer = new IntersectionObserver(callback, options);
  observer.observe(intersectionSentinel.value);
}

async function goToRisksSection() {
  isSentinelIntersected.value = true;
  // Wait for risks section to be rendered
  await nextTick();
  router.push({ path: route.fullPath, hash: '#risks-section' });
}

onMounted(() => {
  addIntersectionObserver();
});
onBeforeUnmount(() => {
  observer?.disconnect();
});
//#endregion

const missingPrices = computed(() => {
  if (pool.value && prices.value && !priceQueryLoading.value) {
    const tokensWithPrice = Object.keys(prices.value);
    const tokens = tokenTreeLeafs(pool.value.tokens);

    return !tokens.every(token => includesAddress(tokensWithPrice, token));
  }
  return false;
});

const titleTokens = computed<PoolToken[]>(() => {
  if (!pool.value || !pool.value.tokens) return [];

  return orderedPoolTokens(pool.value, pool.value.tokens);
});

const isStakablePool = computed(
  (): boolean =>
    POOLS.Stakable.VotingGaugePools.includes(poolId) ||
    POOLS.Stakable.AllowList.includes(poolId)
);

const poolPremintedBptIndex = computed(() => {
  if (!pool.value) return null;
  return preMintedBptIndex(pool.value) ?? null;
});

const showBrandedRedirectCard = computed(() => {
  if (!pool.value) return false;
  return POOLS.BrandedRedirect?.[pool.value.poolType] || false;
});

function setRestakeVisibility(value: boolean): void {
  isRestakePreviewVisible.value = value;
}

/**
 * WATCHERS
 */
watch(
  () => pool.value,
  () => {
    if (pool.value) {
      metaService.setMeta(route, pool.value);
    }
  }
);
</script>

<template>
  <div class="xl:container lg:px-4 pt-8 xl:mx-auto">
    <PointsBanner v-if="pool" :pool="pool" />
    <div
      class="grid grid-cols-1 lg:grid-cols-3 gap-x-0 lg:gap-x-4 xl:gap-x-8 gap-y-8"
    >
      <div class="col-span-2 px-4 lg:px-0">
        <BalLoadingBlock
          v-if="loadingPool || !pool"
          class="header-loading-block"
        />
        <PoolPageHeader
          v-else
          :loadingApr="loadingApr"
          :pool="pool"
          :poolApr="poolApr"
          :isStableLikePool="isStableLikePool"
          :titleTokens="titleTokens"
          :missingPrices="missingPrices"
          :isLiquidityBootstrappingPool="isLiquidityBootstrappingPool"
          :isComposableStableLikePool="isComposableStableLikePool"
          @set-restake-visibility="setRestakeVisibility"
        />
      </div>
      <div class="hidden lg:block" />
      <div class="order-2 lg:order-1 col-span-2">
        <div class="grid grid-cols-1 gap-y-8">
          <div class="px-4 lg:px-0">
            <PoolChart
              :historicalPrices="null"
              :snapshots="snapshots"
              :loading="isLoadingSnapshots"
              :totalLiquidity="pool?.totalLiquidity"
              :tokensList="pool ? tokensListExclBpt(pool) : []"
              :poolType="pool?.poolType"
              :poolPremintedBptIndex="poolPremintedBptIndex"
            />
          </div>
          <div class="px-4 lg:px-0 mb-4">
            <PoolStatCards
              :pool="pool"
              :poolApr="poolApr"
              :loading="loadingPool"
              :loadingApr="loadingApr"
            />
            <ApyVisionPoolLink
              v-if="!loadingPool && pool"
              :poolId="pool.id"
              :tokens="titleTokens"
            />
          </div>
          <div class="mb-4">
            <h3
              class="px-4 lg:px-0 mb-3"
              v-text="$t('poolComposition.title')"
            />
            <BalLoadingBlock v-if="loadingPool" class="h-64" />
            <PoolCompositionCard v-else-if="pool" :pool="pool" />
          </div>

          <div ref="intersectionSentinel" />
          <template v-if="isSentinelIntersected && pool">
            <PoolTransactionsCard :pool="pool" :loading="loadingPool" />
            <PoolContractDetails :pool="pool" />
            <PoolRisks :pool="pool" />
          </template>
        </div>
      </div>

      <div class="order-1 lg:order-2 px-4 lg:px-0">
        <BalStack vertical>
          <BrandedRedirectCard
            v-if="showBrandedRedirectCard && pool"
            :poolType="pool?.poolType"
          />

          <div v-else>
            <BalLoadingBlock
              v-if="loadingPool || !pool"
              class="mb-4 h-60 pool-actions-card"
            />
            <MyPoolBalancesCard
              v-else-if="!isLiquidityBootstrappingPool"
              :pool="pool"
              :missingPrices="missingPrices"
              class="mb-4"
              @risks-clicked="goToRisksSection()"
            />
          </div>

          <BalLoadingBlock v-if="loadingPool" class="h-40 pool-actions-card" />
          <StakingIncentivesCard
            v-if="isStakablePool && !loadingPool && pool && isWalletReady"
            :pool="pool"
            class="staking-incentives"
            @set-restake-visibility="setRestakeVisibility"
          />
          <PoolLockingCard
            v-if="_isVeBalPool && !loadingPool && pool"
            :pool="pool"
            class="pool-locking"
          />
          <PoolMigrationCard
            v-if="
              poolId &&
              isWalletReady &&
              (isDeprecatedPool || isNewPoolAvailable)
            "
            :poolId="poolId"
          />
        </BalStack>
      </div>
      <StakePreviewModal
        v-if="!!pool"
        :isVisible="isRestakePreviewVisible"
        :pool="pool"
        action="restake"
        @close="isRestakePreviewVisible = false"
        @success="isRestakePreviewVisible = false"
      />
    </div>
  </div>
</template>

<style scoped>
.pool-actions-card {
  @apply relative;
}

@media (min-width: 768px) and (min-height: 600px) {
  .pool-actions-card {
    @apply sticky top-24;
  }
}

.staking-incentives :deep(.active-section) {
  @apply border-transparent;
}

.header-loading-block {
  height: 6.75rem;
}
</style>
