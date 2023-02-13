<script setup lang="ts">
</script>

<template>
  <div>
    <div class="app-body">
      <div class="pb-16">
        <router-view v-slot="{ Component }" :key="$route.path">
          <transition appear name="appear">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

.app-body {
  @apply mb-8;

  min-height: calc(100vh - 2rem);
}
</style>
