<script setup lang="ts">
import FocussedLayout from '@/components/layouts/FocussedLayout.vue';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { providePool } from '@/providers/local/pool.provider';

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();

/**
 * PROVIDERS
 */
providePool(poolId);
providePoolStaking(poolId);
</script>

<template>
  <FocussedLayout>
    <router-view v-slot="{ Component }" :key="$route.path">
      <transition appear name="appear">
        <component :is="Component" />
      </transition>
    </router-view>
  </FocussedLayout>
</template>
