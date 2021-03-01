<template>
  <div class="px-4 py-3 flex items-center leading-5">
    <Token :token="token" :size="32" class="mr-3" />
    <div class="flex-auto">
      <div v-text="token.symbol" class="link-color" />
      <div v-text="_shorten(token.name, 'name')" class="text-sm" />
    </div>
    <div class="text-right">
      <div class="link-color">
        {{ _num(token.balance, '0,0.[000]') }}
      </div>
      <div class="text-sm">
        <span
          v-if="token.price24HChange"
          :class="token.price24HChange > 0 ? 'text-green-500' : 'text-red-500'"
        >
          {{ _num(token.price24HChange, '+0,0.[00]') }}%
        </span>
        {{ _num(token.value, '$0,0.[00]') }}
      </div>
    </div>
    <div class="ml-4">
      <router-link
        :to="{ name: 'home', query: { tokens: [token.address] } }"
        class="link-color border rounded px-2 py-2"
      >
        {{ $t('seePools') }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    token: Object
  }
};
</script>
