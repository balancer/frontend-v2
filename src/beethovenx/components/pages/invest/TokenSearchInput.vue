<script setup lang="ts">
import useNumbers from '@/composables/useNumbers';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import { pick, take } from 'lodash';
import { NATIVE_ASSET_ADDRESS, TOKENS } from '@/constants/tokens';
import { getAddress } from '@ethersproject/address';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import { GqlBeetsConfigPoolFilterItem } from '@/beethovenx/services/beethovenx/beethovenx-types';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';

type Props = {
  modelValue: string[];
  loading: boolean;
  filters: GqlBeetsConfigPoolFilterItem[];
  activeFilters: string[];
  activeTab: 'beethovenx-pools' | 'community-pools' | 'my-investments';
};

const emit = defineEmits<{
  (e: 'add', token: string): void;
  (e: 'remove', token: string): void;
  (e: 'toggleFilter', filter: string): void;
}>();

const router = useRouter();
const props = defineProps<Props>();
const { fNum } = useNumbers();
const selectTokenModal = ref(false);
const { tokens, balances, dynamicDataLoading } = useTokens();
const { account, appNetworkConfig } = useWeb3();
const { beethovenxConfig } = useBeethovenxConfig();

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
    .filter(
      token => !beethovenxConfig.value.blacklistedTokens.includes(token.address)
    )
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
</script>

<template>
  <div>
    <p class="px-4 lg:px-0 mb-4" v-if="props.activeTab === 'community-pools'">
      Investment pools created by the community. Please DYOR before investing in
      any community pool.
    </p>
    <div
      v-if="props.activeTab !== 'my-investments'"
      class="flex items-center flex-wrap"
    >
      <div
        v-if="props.activeTab === 'beethovenx-pools'"
        class="flex flex-1 items-center flex-wrap"
      >
        <BalBtn
          v-for="filter in props.filters"
          :key="filter.id"
          :color="
            props.activeFilters.includes(filter.id) ? 'gradient' : 'white'
          "
          size="sm"
          @click="emit('toggleFilter', filter.id)"
          class="mr-2 mb-2 sm:mb-0"
        >
          {{ filter.title }}
        </BalBtn>
      </div>
      <div v-if="props.activeTab === 'community-pools'" class="flex-1">
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
          class="text-gray-400 flex flex-wrap py-2"
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
      <div class="self-start">
        <BalBtn color="white" size="sm" @click="onClick">
          <BalIcon name="search" size="sm" class="mr-2" />
          {{ $t('filterByToken') }}
        </BalBtn>
      </div>
      <div class="break mb-2"></div>
      <BalChip
        v-for="token in props.modelValue"
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

    <teleport to="#modal">
      <SelectTokenModal
        v-if="selectTokenModal"
        :excluded-tokens="props.modelValue"
        @close="selectTokenModal = false"
        @select="addToken"
      />
    </teleport>
  </div>
</template>

<style scoped>
.break {
  flex-basis: 100%;
  height: 0;
}
</style>
