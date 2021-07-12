<template>
  <div>
    <div class="flex items-center flex-wrap">
      <div class="flex items-center flex-wrap">
        <BalBtn color="gray" outline size="sm" @click="onClick" class="mr-4">
          <BalIcon name="search" size="sm" class="mr-2" />
          {{ $t('filterByToken') }}
        </BalBtn>
        <BalChip
          v-for="token in modelValue"
          class="mr-2"
          :key="token"
          color="white"
          iconSize="sm"
          :closeable="true"
          @closed="$emit('remove', token)"
        >
          <BalAsset :address="token" :size="20" class="flex-auto" />
          <span class="ml-2">{{ tokens[token]?.symbol }}</span>
        </BalChip>
      </div>
      <div
        v-if="
          account &&
            !isNotFetchingBalances &&
            !isLoadingBalances &&
            !hasNoBalances
        "
        class="text-gray-400 overflow-x-auto"
      >
        <span class="mr-2">{{ $t('inYourWallet') }}</span>
        <span
          v-for="token in sortedBalances"
          :key="`wallet-${token.symbol}`"
          class="mr-6 cursor-pointer hover:text-blue-700"
          @click="addToken(token.address)"
        >
          {{ token?.symbol }}
        </span>
      </div>
      <div v-else class="text-gray-400 flex flex-wrap py-3">
        <span class="mr-2">{{ $t('popularBases') }}</span>
        <span
          v-for="token in whiteListedTokens"
          :key="`popular-${token.symbol}`"
          class="mr-3 md:mr-4 cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors"
          @click="addToken(token.address)"
        >
          {{ token?.symbol }}
        </span>
      </div>
    </div>
    <teleport to="#modal">
      <SelectTokenModal
        v-if="selectTokenModal"
        :excluded-tokens="modelValue"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import useAccountBalances from '@/composables/useAccountBalances';
import { sortBy, take } from 'lodash';
import { TOKENS } from '@/constants/tokens';
import { ETHER } from '@/constants/tokenlists';
import { getAddress } from '@ethersproject/address';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import { TokenMap } from '@/types';
import useTokens from '@/composables/useTokens';

export default defineComponent({
  name: 'TokenSearchInput',

  components: {
    SelectTokenModal
  },

  emits: ['add', 'remove'],

  props: {
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
    loading: { type: Boolean, default: true }
  },

  setup(props, { emit }) {
    // COMPOSABLES
    const { tokens } = useTokens();
    const {
      isLoading: isLoadingBalances,
      balances,
      isIdle: isNotFetchingBalances
    } = useAccountBalances();
    const { account } = useVueWeb3();

    // sorted by biggest bag balance, limited to biggest 5
    const sortedBalances = computed(() => {
      return take(
        sortBy(Object.values(balances.value || {}), 'balance')
          .reverse()
          .filter(
            (balance: any) =>
              !props.modelValue.includes(balance.address) &&
              balance.address !== ETHER.address
          ),
        6
      );
    });

    const hasNoBalances = computed(() => !sortedBalances.value.length);
    const whiteListedTokens = computed(() =>
      Object.values(tokens.value as TokenMap)
        .filter(token => TOKENS.Popular.Symbols.includes(token.symbol))
        .filter(balance => !props.modelValue.includes(balance.address))
    );

    // DATA
    const selectTokenModal = ref(false);

    // METHODS
    function addToken(token: string) {
      let _token = token;
      // special case for ETH where we want it to filter as WETH regardless
      // as ETH is the native asset
      if (getAddress(token) === ETHER.address) {
        _token = TOKENS.AddressMap.WETH;
      }
      // const newSelected = [...props.modelValue, _token];
      emit('add', _token);
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
      tokens,
      // methods
      addToken,
      onClick
    };
  }
});
</script>
