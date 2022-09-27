<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useRoute } from 'vue-router';

// Composables
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { bnum, isSameAddress } from '@/lib/utils';
import { Pool } from '@/services/pool/types';

// Components
import AssetRow from './components/AssetRow.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  useNativeAsset: boolean;
  hideHeader?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  hideHeader: false,
});

const emit = defineEmits<{
  (e: 'update:useNativeAsset', value: boolean): void;
}>();

/**
 * COMPOSABLES
 */
const { isWethPool, isDeepPool } = usePool(toRef(props, 'pool'));
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { fNum2, toFiat } = useNumbers();
const route = useRoute();

/**
 * COMPUTED
 */
const pageContext = computed(() => route.name);

const tokenAddresses = computed((): string[] => {
  if (isDeepPool.value) {
    return props.pool.mainTokens || [];
  }

  return props.pool.tokensList;
});

const tokensForTotal = computed((): string[] => {
  if (pageContext.value === 'invest' && props.useNativeAsset) {
    return tokenAddresses.value.map(address => {
      if (isSameAddress(address, wrappedNativeAsset.value.address))
        return nativeAsset.address;
      return address;
    });
  } else if (pageContext.value === 'withdraw' && isWethPool.value) {
    return [nativeAsset.address, ...tokenAddresses.value];
  }

  return tokenAddresses.value;
});

const fiatTotal = computed(() => {
  const fiatValue = tokensForTotal.value
    .map(address => {
      if (pageContext.value === 'invest') {
        if (
          isSameAddress(address, nativeAsset.address) &&
          !props.useNativeAsset
        )
          return '0';
        if (
          isSameAddress(address, wrappedNativeAsset.value.address) &&
          props.useNativeAsset
        )
          return '0';
      }

      const tokenBalance = balanceFor(address);
      return toFiat(tokenBalance, address);
    })
    .reduce((total, value) => bnum(total).plus(value).toString());

  return fNum2(fiatValue, FNumFormats.fiat);
});

/**
 * METHODS
 */
function isSelectedNativeAsset(address: string): boolean {
  if (pageContext.value === 'withdraw') return true;
  if (props.useNativeAsset && isSameAddress(address, nativeAsset.address))
    return true;

  return (
    !props.useNativeAsset &&
    isSameAddress(address, wrappedNativeAsset.value.address)
  );
}
</script>

<template>
  <BalCard shadow="none" noPad>
    <template v-if="!hideHeader" #header>
      <div class="p-4 w-full border-b dark:border-gray-900">
        <h6>
          {{ $t('poolTransfer.myWalletTokensCard.title') }}
        </h6>
      </div>
    </template>

    <div class="p-4 -mt-2">
      <div v-for="address in tokenAddresses" :key="address" class="py-2">
        <div v-if="isSameAddress(address, wrappedNativeAsset.address)">
          <div class="flex justify-between items-start">
            <BalBreakdown
              :items="[nativeAsset, wrappedNativeAsset]"
              class="w-full"
              size="lg"
            >
              <div class="flex">
                <span>
                  {{ nativeAsset.name }}
                  <span class="lowercase">{{ $t('tokens') }}</span>
                </span>
                <BalTooltip
                  v-if="pageContext === 'invest'"
                  class="mt-1 ml-2"
                  iconSize="sm"
                  :text="
                    $t(
                      'poolTransfer.myWalletTokensCard.tooltips.nativeAssetSelection',
                      [nativeAsset.symbol, wrappedNativeAsset.symbol]
                    )
                  "
                />
              </div>
              <template #item="{ item: asset }">
                <AssetRow
                  :address="asset.address"
                  :selected="isSelectedNativeAsset(asset.address)"
                  :class="[{ 'cursor-pointer': pageContext === 'invest' }]"
                  @click="
                    emit(
                      'update:useNativeAsset',
                      isSameAddress(asset.address, nativeAsset.address)
                    )
                  "
                />
              </template>
            </BalBreakdown>
          </div>
        </div>

        <AssetRow v-else :address="address" :selected="true" />
      </div>
      <div class="flex justify-between pt-4 font-medium">
        <span>
          {{ $t('total') }}
        </span>
        <span class="text-right">
          {{ fiatTotal }}
        </span>
      </div>
    </div>
  </BalCard>
</template>
