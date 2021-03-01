<template>
  <div class="flex py-3 px-4 highlight items-center leading-5 text-base">
    <img
      :src="_url(tokenlist.logoURI)"
      class="rounded-full inline-block align-middle mr-2"
      width="34"
      height="34"
    />
    <div class="flex-auto">
      {{ tokenlist.name }}
      <div class="text-gray text-sm">
        {{ _num(tokenlist.tokens.length) }} {{ $t('tokensLowerCase') }}
      </div>
    </div>
    <Icon
      :name="tokenlist.active ? 'toggle-on' : 'toggle_off'"
      :class="tokenlist.active ? 'text-green-500' : 'border-color'"
      size="42"
    />
  </div>
</template>

<script>
export default {
  props: {
    tokenlist: Object
  }
};
</script>
