<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppHero from '@/components/heros/AppHero.vue';
import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork from '@/composables/useNetwork';
import { useFirstContentLoad } from '@/composables/useFirstContentLoad';

// Async load components with heavy dependencies (web3 related) to boost first content load
// const Pools = defineAsyncComponent(() => import('./Pools.vue'));
// const TokenSearch = defineAsyncComponent(() => import('./TokenSearch.vue'));
// const HomePageHero = defineAsyncComponent(
//   () => import('@/components/heros/HomePageHero.vue')
// );

// COMPOSABLES
const router = useRouter();
const { isFirstContentPainted } = useFirstContentLoad();
const { upToMediumBreakpoint } = useBreakpoints();
const { networkSlug, networkConfig, appNetworkConfig } = useNetwork();
const isElementSupported = appNetworkConfig.supportsElementPools;

/**
 * METHODS
 */
function navigateToCreatePool() {
  router.push({ name: 'create-pool', params: { networkSlug } });
}
</script>

<template>
  <div>
    isFirstContentPainted {{ isFirstContentPainted }}

    <AppHero v-if="!isFirstContentPainted" class="h-44"></AppHero>
    <!-- Load with async component -->
    <!-- <HomePageHero v-else /> -->
    <div class="xl:container xl:px-4 pt-10 md:pt-8 xl:mx-auto">
      <BalStack vertical>
        <div class="px-4 xl:px-0">
          <div class="flex justify-between items-end mb-2">
            <h3>
              {{ networkConfig.chainName }}
              <span class="lowercase">{{ $t('pools') }}</span>
            </h3>
            <BalBtn
              v-if="upToMediumBreakpoint"
              color="blue"
              size="sm"
              outline
              :class="{ 'mt-4': upToMediumBreakpoint }"
              @click="navigateToCreatePool"
            >
              {{ $t('createAPool.title') }}
            </BalBtn>
          </div>

          <div
            class="flex flex-col md:flex-row justify-between items-end lg:items-center w-full"
          >
            <div class="w-full md:w-2/3">
              <BalLoadingBlock v-if="!isFirstContentPainted" class="h-10" />
              <!-- <TokenSearch v-else /> -->
            </div>
            <BalBtn
              v-if="!upToMediumBreakpoint"
              color="blue"
              size="sm"
              outline
              :class="{ 'mt-4': upToMediumBreakpoint }"
              :block="upToMediumBreakpoint"
              @click="navigateToCreatePool"
            >
              {{ $t('createAPool.title') }}
            </BalBtn>
          </div>
        </div>
        <div class="mb-8">
          <BalLoadingBlock
            v-if="!isFirstContentPainted"
            class="pools-table-loading-height"
          />
          <!-- <Pools v-else /> -->
        </div>

        <div v-if="isElementSupported" class="p-4 xl:p-0 mt-16">
          <FeaturedProtocols />
        </div>
      </BalStack>
    </div>
  </div>
</template>

<style>
.pools-table-loading-height {
  height: 40rem;
}
</style>
