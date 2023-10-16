<script setup lang="ts">
import DefaultLayout from '@/components/layouts/DefaultLayout.vue';
import FocussedLayout from '@/components/layouts/FocussedLayout.vue';
import { createProviderComponent } from '@/providers/createProviderComponent';
import { providePool } from '@/providers/local/pool.provider';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { provideUserTokens } from '@/providers/local/user-tokens.provider';

/**
 * STATE
 */
const route = useRoute();

/**
 * We need this explicit PoolProvider wrapper component to refresh the provided pool details when the pool route params change.
 * Example:
 * If the poolId param changes in the url, then <router-view v-slot="{ Component }" :key="$route.path"> will reload its contents
 * because the route key ($route.path) changed.
 * That means that PoolProvider wrapper component will be rerendered providing the data for the new pool.
 */
const PoolProvider = createProviderComponent(() => {
  const route = useRoute();
  const poolId = (route.params.id as string).toLowerCase();

  providePool(poolId);
  providePoolStaking(poolId);
  provideUserTokens();
});

/**
 * COMPUTED
 */
const isJoinOrExitPath = computed(
  () => route.path.includes('add-liquidity') || route.path.includes('withdraw')
);

const layoutComponent = computed(() =>
  isJoinOrExitPath.value ? FocussedLayout : DefaultLayout
);
</script>

<template>
  <component :is="layoutComponent">
    <router-view v-slot="{ Component }" :key="$route.fullPath">
      <PoolProvider>
        <transition appear name="appear">
          <component :is="Component" />
        </transition>
      </PoolProvider>
    </router-view>
  </component>
</template>
