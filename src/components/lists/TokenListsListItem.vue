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
        {{
          fNum2(tokenlist.tokens.length, {
            style: 'decimal',
            maximumFractionDigits: 1,
            abbreviate: true
          })
        }}
        {{ $t('tokensLowerCase') }}
        <BalLink :href="listUrl" external class="flex items-center">
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-1 text-gray-500 hover:text-blue-500 transition-colors"
          />
        </BalLink>
      </div>
    </div>
    <BalToggle
      v-if="notBalancer"
      name="active"
      :checked="isActive"
      @toggle="$emit('toggle')"
    />
  </div>
</template>

<script lang="ts">
import { PropType, reactive, toRefs } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { TokenList } from '@/types/TokenList';
import useUrls from '@/composables/useUrls';

export default {
  name: 'TokenListsListItem',

  props: {
    tokenlist: {
      type: Object as PropType<TokenList>
    },
    uri: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },

  emits: ['toggle'],

  setup(props) {
    /**
     * COMPOSABLES
     */
    const { fNum2 } = useNumbers();
    const { resolve } = useUrls();

    /**
     * STATE
     */
    const state = reactive({
      notBalancer: props.tokenlist?.name !== 'Balancer',
      listUrl: resolve(props.uri)
    });

    return {
      ...toRefs(state),
      fNum2
    };
  }
};
</script>
