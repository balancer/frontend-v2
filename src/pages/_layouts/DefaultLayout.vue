<script setup lang="ts">
import DefaultLayout from '@/components/layouts/DefaultLayout.vue';
</script>

<template>
  <DefaultLayout>
    <router-view v-slot="{ Component }" :key="$route.path">
      <transition appear name="appear">
        <component :is="Component" />
      </transition>
    </router-view>
  </DefaultLayout>
</template>
