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
        {{ fNum(tokenlist.tokens.length) }} {{ $t('tokensLowerCase') }}
      </div>
    </div>
    <Icon
      :name="isActive ? 'toggle-on' : 'toggle_off'"
      :class="isActive ? 'text-green-500' : 'border-color'"
      size="42"
    />
  </div>
</template>

<script lang="ts">
import useNumbers from '@/composables/useNumbers';

export default {
  props: {
    tokenlist: Object,
    isActive: Boolean
  },
  emits: ['onListSelected'],
  setup() {
    const { fNum } = useNumbers();

    return {
      fNum,
      console
    };
  }
};
</script>
