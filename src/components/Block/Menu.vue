<template>
  <Block title="Menu">
    <p class="d-flex flex-column">
      <router-link :to="{ name: 'home' }">
        Explore
      </router-link>
      <router-link :to="{ name: 'create' }">
        Create pool
      </router-link>
      <router-link :to="{ name: 'portfolio' }">
        Portfolio
      </router-link>
      <router-link :to="{ name: 'vault' }">
        Vault
      </router-link>
    </p>
  </Block>
</template>
