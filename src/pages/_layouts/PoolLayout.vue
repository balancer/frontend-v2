<script setup lang="ts">
import FocussedLayout from '@/components/layouts/FocussedLayout.vue';
import DefaultLayout from '@/components/layouts/DefaultLayout.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { providePool } from '@/providers/local/pool.provider';
import { provideUserTokens } from '@/providers/local/user-tokens.provider';

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();

/**
 * COMPUTED
 */
const isJoinOrExitPath = computed(
  () => route.path.includes('add-liquidity') || route.path.includes('withdraw')
);

const layoutComponent = computed(() =>
  isJoinOrExitPath.value ? FocussedLayout : DefaultLayout
);

/**
 * PROVIDERS
 */
providePool(poolId);
providePoolStaking(poolId);
provideUserTokens();
</script>

<template>
  <component :is="layoutComponent">
    <router-view v-slot="{ Component }" :key="$route.path">
      <transition appear name="appear">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>
