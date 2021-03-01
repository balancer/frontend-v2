<template>
  <Block
    :slim="true"
    class="mainmenu sliding px-2 md:px-4 pb-1 text-base md:text-lg"
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
    <router-link
      :to="{ name: 'create' }"
      v-text="$t('createPool')"
      class="md:mx-2 px-2 py-5 inline-block"
    />
  </Block>
</template>

<style lang="scss" scoped>
.mainmenu {
  a {
    color: var(--text-color);

    &.router-link-exact-active {
      color: var(--link-color);
      background-image: url('~@/assets/red-bullet.svg');
      background-repeat: no-repeat;
      background-position: top 18px right 0;
    }
  }
}
</style>
