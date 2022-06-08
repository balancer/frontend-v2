<script setup lang="ts">
import { getAddress } from '@ethersproject/address';
import { compact, pick, take } from 'lodash';
import { computed, ref } from 'vue';

import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import useTokens from '@/composables/useTokens';
import useVeBal from '@/composables/useVeBAL';
import { NATIVE_ASSET_ADDRESS, TOKENS } from '@/constants/tokens';
import { includesAddress } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';

type Props = {
  modelValue: string[];
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  loading: true
});

const emit = defineEmits<{
  (e: 'add', token: string): void;
  (e: 'remove', token: string): void;
}>();

/**
 * STATE
 */
const selectTokenModal = ref(false);

/**
 * COMPOSABLES
 */
const { tokens, balances, dynamicDataLoading } = useTokens();
const { account, appNetworkConfig } = useWeb3();
const { veBalTokenInfo } = useVeBal();

/**
 * COMPUTED
 */
// sorted by biggest bag balance, limited to biggest 5
const sortedBalances = computed(() => {
  const addressesWithBalance = Object.entries(balances.value)
    .filter(
      ([address, balance]) =>
        balance !== '0.0' && address !== veBalTokenInfo.value?.address
    )
    .map(([address]) => address);
  const tokensWithBalance = Object.values(
    pick(tokens.value, addressesWithBalance)
  );

  return take(tokensWithBalance, 6);
});

const hasNoBalances = computed(() => !sortedBalances.value.length);

const whiteListedTokens = computed(() =>
  Object.values(tokens.value)
    .filter(token => TOKENS.Popular.Symbols.includes(token.symbol))
    .filter(token => !includesAddress(props.modelValue, token.address))
);

/**
 * METHODS
 */
function addToken(token: string) {
  let _token = token;
  // special case for ETH where we want it to filter as WETH regardless
  // as ETH is the native asset
  if (getAddress(token) === NATIVE_ASSET_ADDRESS) {
    _token = appNetworkConfig.addresses.weth;
  }
  // const newSelected = [...props.modelValue, _token];
  emit('add', _token);
}

function onClick() {
  if (!props.loading) selectTokenModal.value = true;
}
</script>
<template>
  <div>
    <div class="flex items-center flex-wrap">
      <div class="flex items-center flex-wrap">
        <BalBtn color="white" size="sm" @click="onClick" class="mr-4 mb-2">
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
          @closed="emit('remove', token)"
        >
          <BalAsset :address="token" :size="20" class="flex-auto" />
          <span class="ml-2">{{ tokens[token]?.symbol }}</span>
        </BalChip>
      </div>
      <div
        v-if="account && !dynamicDataLoading && !hasNoBalances"
        class="text-gray-400 overflow-x-auto"
      >
        <span class="mr-2">{{ $t('inYourWallet') }}:</span>
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
        :excluded-tokens="compact([...modelValue, veBalTokenInfo?.address])"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </div>
</template>
