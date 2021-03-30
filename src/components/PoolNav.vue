<template>
  <div class="flex border-b pb-4">
    <router-link :to="{ name: 'home' }" class="flex items-center text-sm">
      <BalIcon name="arrow-left" size="sm" />
      <span class="ml-5">Investment pools</span>
    </router-link>
    <router-link :to="{ name: 'portfolio' }" class="text-sm">
      <span class="ml-8">My Portfolio</span>
    </router-link>
  </div>
</template>
