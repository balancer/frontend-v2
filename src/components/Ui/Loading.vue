<template>
  <div
    v-if="app.loading || !app.init"
    class="h-screen w-full flex items-center justify-center"
  >
    <BalLoadingIcon />
  </div>
</template>
