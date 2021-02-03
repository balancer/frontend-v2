<template>
  <Block :title="$t('menu')">
    <p class="d-flex flex-column">
      <router-link :to="{ name: 'home' }">
        {{ $t('explore') }}
      </router-link>
      <router-link :to="{ name: 'create' }">
        {{ $t('createPool') }}
      </router-link>
      <router-link :to="{ name: 'portfolio' }">
        {{ $t('portfolio') }}
      </router-link>
      <router-link :to="{ name: 'vault' }">
        {{ $t('vault') }}
      </router-link>
    </p>
  </Block>
</template>
