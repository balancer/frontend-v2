<script setup lang="ts">
import { FocussedLayout, layoutProviders } from './async-layout-components';
const JoinExitLayoutProvider = layoutProviders.JoinExitLayoutProvider;

/**
 * STATE
 */
</script>

<template>
  <FocussedLayout>
    <JoinExitLayoutProvider>
      <router-view v-slot="{ Component }" :key="$route.path">
        <transition appear name="appear">
          <component :is="Component" />
        </transition>
      </router-view>
    </JoinExitLayoutProvider>
  </FocussedLayout>
</template>
