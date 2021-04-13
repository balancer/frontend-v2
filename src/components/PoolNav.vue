<template>
  <div class="flex border-b pb-4">
    <router-link :to="{ name: 'home' }" class="flex items-center text-sm">
      <BalIcon name="arrow-left" size="sm" />
      <span v-text="$t('investmentPools')" class="ml-5" />
    </router-link>
    <router-link :to="{ name: 'portfolio' }" class="text-sm">
      <span v-text="$t('myPortfolio')" class="ml-8" />
    </router-link>
  </div>
</template>
