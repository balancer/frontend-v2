<template>
  <div class="flex py-3 px-4 highlight items-center leading-5 text-base">
    <img
      :src="_url(tokenlist.logoURI)"
      class="rounded-full inline-block align-middle mr-3"
      width="34"
      height="34"
    />
    <div class="flex-auto">
      {{ tokenlist.name }}
      <div class="text-gray text-sm flex items-center">
        {{ fNum(tokenlist.tokens.length) }} {{ $t('tokensLowerCase') }}
        <BalLink
          :href="tokenlist.tokenListsURL"
          external
          class="flex items-center"
        >
          <BalIcon
            name="external-link"
            size="sm"
            class="ml-1 text-gray-500 hover:text-blue-500"
          />
        </BalLink>
      </div>
    </div>
    <BalToggle name="active" :checked="isActive" @toggle="$emit('toggle')" />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { TokenList } from '@/types/TokenList';

export default {
  name: 'TokenListsListItem',

  props: {
    tokenlist: {
      type: Object as PropType<TokenList>
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },

  emits: ['toggle'],

  setup() {
    const { fNum } = useNumbers();

    return {
      fNum
    };
  }
};
</script>
