<template>
  <div>
    <div class="flex items-center flex-wrap">
      <div class="flex items-center flex-wrap">
        <BalBtn color="gray" outline size="sm" @click="onClick" class="mr-4">
          <BalIcon name="search" size="sm" class="mr-2" />
          Filter by token
        </BalBtn>
        <BalChip
          v-for="token in modelValue"
          class="mr-2"
          :key="token"
          color="white"
          iconSize="sm"
          :closeable="true"
          @closed="removeToken(token)"
        >
          <BalAsset :address="token" :size="20" class="flex-auto" />
          <span class="ml-2">{{ allTokens[token]?.symbol }}</span>
        </BalChip>
      </div>
      <div
        class="text-gray-400 my-4 overflow-x-auto ml-4"
        v-if="
          account &&
            !isNotFetchingBalances &&
            !isLoadingBalances &&
            !hasNoBalances
        "
      >
        <span class="mr-6">In your wallet:</span>
        <span
          v-for="token in sortedBalances"
          :key="`wallet-${token.symbol}`"
          class="mr-6 cursor-pointer hover:text-blue-700"
          @click="addToken(token.address)"
        >
          {{ token?.symbol }}
        </span>
      </div>
      <div class="text-gray-400 my-4 flex flex-wrap" v-else>
        <span class="mr-6">Popular Bases:</span>
        <span
          v-for="token in whiteListedTokens"
          :key="`popular-${token.symbol}`"
          class="mr-6 cursor-pointer hover:text-gray-700"
          @click="addToken(token.address)"
        >
          {{ token?.symbol }}
        </span>
      </div>
    </div>
    <teleport to="#modal">
      <SelectTokenModal
        :open="selectTokenModal"
        :excluded-tokens="modelValue"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal.vue';
import useTokens from '@/composables/useTokens';
import useAccountBalances from '@/composables/useAccountBalances';
import { sortBy, take } from 'lodash';
import useWeb3 from '@/composables/useWeb3';
import { TOKENS } from '@/constants/tokens';

export default defineComponent({
  name: 'TokenSearchInput',

  components: {
    SelectTokenModal
  },

  emits: ['update:modelValue'],

  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
    loading: { type: Boolean, default: true }
  },

  setup(props, { emit }) {
    // COMPOSABLES
    const { allTokens } = useTokens();
    const {
      isLoading: isLoadingBalances,
      balances,
      isIdle: isNotFetchingBalances
    } = useAccountBalances();
    const { account } = useWeb3();

    // sorted by biggest bag balance, limited to biggest 5
    const sortedBalances = computed(() => {
      return take(
        sortBy(Object.values(balances.value || {}), 'balance')
          .reverse()
          .filter(
            (balance: any) => !props.modelValue.includes(balance.address)
          ),
        6
      );
    });

    const hasNoBalances = computed(() => !sortedBalances.value.length);
    const whiteListedTokens = computed(() =>
      Object.values(allTokens.value)
        .filter((token: any) => TOKENS.Popular.Symbols.includes(token.symbol))
        .filter((balance: any) => !props.modelValue.includes(balance.address))
    );

    // DATA
    const selectTokenModal = ref(false);

    // METHODS
    function addToken(token: string) {
      const newSelected = [...props.modelValue, token];
      emit('update:modelValue', newSelected);
    }

    function removeToken(token: string) {
      const newSelected = props.modelValue.filter(t => t !== token);
      emit('update:modelValue', newSelected);
    }

    function onClick() {
      if (!props.loading) selectTokenModal.value = true;
    }

    return {
      // data
      selectTokenModal,
      isNotFetchingBalances,
      isLoadingBalances,
      balances,
      sortedBalances,
      account,
      hasNoBalances,
      whiteListedTokens,
      // computed
      allTokens,
      // methods
      addToken,
      removeToken,
      onClick
    };
  }
});
</script>
