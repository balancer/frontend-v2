<template>
  <Block :slim="true" class="mainmenu sliding px-4 py-2">
    <router-link
      :to="{ name: 'portfolio' }"
      v-text="$t('myPortfolio')"
      class="p-4 inline-block"
    />
    <router-link
      :to="{ name: 'home' }"
      v-text="$t('investmentPools')"
      class="p-4 inline-block"
    />
    <router-link
      :to="{ name: 'create' }"
      v-text="$t('createPool')"
      class="p-4 inline-block"
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
      background-position: top 16px right 8px;
    }
  }
}
</style>
