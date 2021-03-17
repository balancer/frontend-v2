<template>
  <Block
    :slim="true"
    class="mainmenu bg-white sliding px-2 md:px-4 pb-1 text-base md:text-lg"
  >
    <router-link
      :to="{ name: 'portfolio' }"
      v-text="$t('myPortfolio')"
      class="md:mx-2 px-2 py-5 inline-block"
    />
    <router-link
      :to="{ name: 'home' }"
      v-text="$t('investmentPools')"
      class="md:mx-2 px-2 py-5 inline-block"
    />
  </Block>
</template>

<style lang="css" scoped>
.mainmenu > a {
  @apply text-gray-700;
}
.mainmenu a.router-link-exact-active {
  @apply text-black dark:text-white font-medium;
}
</style>
