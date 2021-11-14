<template>
  <div>
    <div class="flex items-center flex-wrap">
      <div class="flex items-center flex-wrap">
        <BalBtn color="white" size="sm" @click="onClick" class="mr-4">
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
        v-if="account && !dynamicDataLoading && !hasNoBalances"
        class="text-gray-400 overflow-x-auto"
      >
        <span class="mr-2">{{ $t('inYourWallet') }}</span>
        <span
          v-for="token in sortedBalances"
          :key="`wallet-${token.symbol}`"
          class="mr-6 cursor-pointer hover:text-green-500"
          @click="addToken(token.address)"
        >
          {{ token?.symbol }}
        </span>
      </div>
      <div
        v-else-if="whiteListedTokens.length > 0"
        class="text-gray-400 flex flex-wrap py-3"
      >
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
import { pick, take } from 'lodash';
import { NATIVE_ASSET_ADDRESS, TOKENS } from '@/constants/tokens';
import { getAddress } from '@ethersproject/address';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { TokenInfo } from '@/types/TokenList';

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
    /**
     * STATE
     */
    const selectTokenModal = ref(false);

    /**
     * COMPOSABLES
     */
    const { tokens, balances, dynamicDataLoading } = useTokens();
    const { account, appNetworkConfig } = useWeb3();

    /**
     * COMPUTED
     */
    // sorted by biggest bag balance, limited to biggest 5
    const sortedBalances = computed(() => {
      const addressesWithBalance = Object.entries(balances.value)
        .filter(balance => balance[1] !== '0.0' && balance[1] !== '0')
        .map(balance => balance[0]);
      const tokensWithBalance = Object.values(
        pick(tokens.value, addressesWithBalance)
      ).filter(token => !isTokenSelected(token.address));

      return take(tokensWithBalance, 6);
    });

    const hasNoBalances = computed(() => !sortedBalances.value.length);

    const whiteListedTokens = computed(() =>
      Object.values(tokens.value)
        .filter(token => TOKENS.Popular.Symbols.includes(token.symbol))
        .filter(token => !isTokenSelected(token.address))
    );

    function isTokenSelected(token: string) {
      const eth = TOKENS.AddressMap[appNetworkConfig.key].ETH;
      const weth = TOKENS.AddressMap[appNetworkConfig.key].WETH;

      if (token === eth && props.modelValue.includes(weth)) {
        return true;
      }

      return props.modelValue.includes(token);
    }

    /**
     * METHODS
     */
    function addToken(token: string) {
      let _token = token;
      // special case for ETH where we want it to filter as WETH regardless
      // as ETH is the native asset
      if (getAddress(token) === NATIVE_ASSET_ADDRESS) {
        _token = TOKENS.AddressMap[appNetworkConfig.key].WETH;
      }
      // const newSelected = [...props.modelValue, _token];
      emit('add', _token);
    }

    function onClick() {
      if (!props.loading) selectTokenModal.value = true;
    }

    return {
      // state
      selectTokenModal,
      // computed
      tokens,
      dynamicDataLoading,
      balances,
      sortedBalances,
      account,
      hasNoBalances,
      whiteListedTokens,
      // methods
      addToken,
      onClick
    };
  }
});
</script>
