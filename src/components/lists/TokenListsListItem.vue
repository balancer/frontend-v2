<template>
  <div class="flex items-center py-3 px-4 text-base leading-5 highlight">
    <img
      :src="url(tokenlist.logoURI)"
      class="inline-block mr-3 align-middle rounded-full"
      width="34"
      height="34"
    />
    <div class="flex-auto">
      {{ tokenlist.name }}
      <div class="flex items-center text-sm text-gray">
        {{
          fNum2(tokenlist.tokens.length, {
            style: 'decimal',
            maximumFractionDigits: 1,
            abbreviate: true,
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
import useUrls from '@/composables/useUrls';
import { TokenList } from '@/types/TokenList';

export default {
  name: 'TokenListsListItem',

  props: {
    tokenlist: {
      type: Object as PropType<TokenList>,
      required: true,
    },
    uri: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
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
      listUrl: resolve(props.uri),
    });

    function url(url) {
      if (!url) return '';
      return url
        .replace('ipfs://', `https://${process.env.VUE_APP_IPFS_NODE}/ipfs/`)
        .replace('ipns://', `https://${process.env.VUE_APP_IPFS_NODE}/ipns/`);
    }

    return {
      ...toRefs(state),
      url,
      fNum2,
    };
  },
};
</script>
