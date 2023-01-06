<template>
  <router-view v-slot="{ Component }" :key="$route.path">
    <transition appear name="appear">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
