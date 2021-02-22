<template>
  <router-link :to="{ name: 'home' }" class="inline-block text-gray mb-2">
    <Icon name="back" size="22" class="v-align-middle" />
    {{ $t('home') }}
  </router-link>
</template>
