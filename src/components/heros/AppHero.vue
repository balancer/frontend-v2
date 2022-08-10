<template>
  <div class="app-hero">
    <div class="mx-auto w-full max-w-2xl">
      <slot />
    </div>
  </div>
</template>

<style>
.app-hero {
  @apply bg-cover bg-center flex items-center justify-center text-center px-4;

  transition: all 0.3s ease-in-out;
  background-image: url('/images/backgrounds/bg-header.svg');
}
</style>
