<template>
  <BalCard class="menu text-gray-700 p-4" no-pad>
    <router-link
      :to="{ name: 'portfolio' }"
      v-text="$t('myPortfolio')"
      class="mr-4"
    />
    <router-link
      :to="{ name: 'home' }"
      v-text="$t('investmentPools')"
      class=""
    />
  </BalCard>
</template>

<style lang="css" scoped>
.menu a.router-link-exact-active {
  @apply text-black dark:text-white font-medium;
}
</style>
