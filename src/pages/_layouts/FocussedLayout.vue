<script setup lang="ts">
import FocussedLayout from '@/components/layouts/FocussedLayout.vue';
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
