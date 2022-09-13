<script setup lang="ts">
import { getAddress } from '@ethersproject/address';
import { compact, pick, take } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import useTokens from '@/composables/useTokens';
import useVeBal from '@/composables/useVeBAL';
import { NATIVE_ASSET_ADDRESS, TOKENS } from '@/constants/tokens';
import { includesAddress } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';

import TokenSearchInputSelectTokens from './TokenSearchInputSelectTokens.vue';
import useBreakpoints from '@/composables/useBreakpoints';

type Props = {
  modelValue: string[];
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
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
const { getToken, tokens, balances } = useTokens();
const { account, appNetworkConfig } = useWeb3();
const { veBalTokenInfo } = useVeBal();
const { t } = useI18n();
const { upToMediumBreakpoint } = useBreakpoints();

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
  Object.values(tokens.value).filter(token =>
    TOKENS.Popular.Symbols.includes(token.symbol)
  )
);

const selectTokensLabel = computed(() => {
  return !account.value || hasNoBalances.value
    ? t('popularBases')
    : t('myWallet2');
});

const selectableTokensAddresses = computed<string[]>(() => {
  const tokens =
    !account.value || hasNoBalances.value
      ? whiteListedTokens.value
      : sortedBalances.value;

  return tokens.reduce(
    (acc, token) =>
      includesAddress(props.modelValue, token.address)
        ? acc
        : [...acc, token.address],
    [] as string[]
  );
});

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
  selectTokenModal.value = true;
}
</script>
<template>
  <div>
    <div class="flex flex-wrap gap-x-6 gap-y-3 items-stretch">
      <BalBtn
        color="white"
        size="sm"
        :block="upToMediumBreakpoint"
        @click="onClick"
      >
        <BalIcon name="search" size="sm" class="mr-2" />
        {{ $t('filterByToken') }}
      </BalBtn>
      <div v-if="modelValue.length" class="flex flex-wrap gap-2 items-center">
        <BalChip
          v-for="token in modelValue"
          :key="token"
          color="white"
          iconSize="sm"
          :closeable="true"
          @closed="emit('remove', token)"
        >
          <BalAsset :address="token" :size="20" class="flex-auto" />
          <span class="ml-2">{{ getToken(token)?.symbol }}</span>
        </BalChip>
      </div>
      <TokenSearchInputSelectTokens
        v-if="selectableTokensAddresses.length"
        :label="selectTokensLabel"
        :addresses="selectableTokensAddresses"
        @click="address => addToken(address)"
      />
    </div>
    <teleport to="#modal">
      <SelectTokenModal
        v-if="selectTokenModal"
        :excludedTokens="compact([...modelValue, veBalTokenInfo?.address])"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </div>
</template>
