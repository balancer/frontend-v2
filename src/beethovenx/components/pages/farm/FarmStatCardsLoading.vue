<template>
  <div class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
    </div>
    <div class="pl-4 pr-8">
      <BalLoadingBlock class="h-48" />
    </div>
  </div>
</template>
