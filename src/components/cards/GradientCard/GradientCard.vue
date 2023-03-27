<template>
  <BalCard shadow="2xl" noPad class="bg-cover rounded-xl gradients" growContent>
    <slot></slot>
  </BalCard>
</template>

<style scoped>
.gradients {
  background-image: url('/images/gradients/gradient-1.avif'),
    url('/images/gradients/gradient-1.jpg');
}
</style>