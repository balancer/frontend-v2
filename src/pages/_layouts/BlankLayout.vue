<template>
  <router-view v-slot="{ Component, route }">
    <transition appear name="appear">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
