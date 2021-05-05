<template>
  <div class="flex py-3 px-4 highlight items-center leading-5 text-base">
    <BalAsset :address="token.address" :size="34" class="mr-2" />
    <div class="flex-auto">
      {{ token.symbol }}
      <div class="text-gray text-sm w-40 md:w-60 truncate">
        {{ token.name }}
      </div>
    </div>
    <span class="text-right">
      <template v-if="token.balance > 0">
        {{ fNum(token.balance, '0,0.[000]') }}
      </template>
      <template v-else>-</template>
      <div class="text-gray text-sm">
        <template v-if="token.value > 0">
          {{ fNum(token.value, '$0,0.[00]') }}
        </template>
        <template v-else>-</template>
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import useNumbers from '@/composables/useNumbers';

export default {
  props: {
    token: Object
  },
  setup() {
    const { fNum } = useNumbers();

    return {
      fNum
    };
  }
};
</script>
