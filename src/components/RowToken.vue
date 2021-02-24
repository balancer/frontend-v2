<template>
  <div class="flex py-3 px-4 highlight items-center leading-5">
    <Token :token="token" :size="34" class="mr-2" />
    <div class="flex-auto">
      {{ token.symbol }}
      <div class="text-gray">
        <small>
          {{ _shorten(token.name, 'name') }}
        </small>
      </div>
    </div>
    <span class="text-right">
      <template v-if="token.balance > 0">
        {{ _num(token.balance, '0,0.[000]') }}
      </template>
      <template v-else>-</template>
      <div class="text-gray">
        <small>
          <template v-if="token.value > 0">
            {{ _num(token.value, '$0,0.[00]') }}
          </template>
          <template v-else>-</template>
        </small>
      </div>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    token: Object
  }
};
</script>
