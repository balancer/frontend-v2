<script setup lang="ts">
import { computed } from 'vue';
import { bnum } from '@/lib/utils';
import { FullPool } from '@/services/balancer/subgraph/types';
// Composables
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import useTokens from '@/composables/useTokens';
// Components
import AssetRow from './components/AssetRow.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  useNativeAsset: boolean;
  hideHeader?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  hideHeader: false
});

const emit = defineEmits<{
  (e: 'update:useNativeAsset', value: boolean): void;
}>();

/**
 * COMPOSABLES
 */
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();

/**
 * COMPUTED
 */
const tokenAddresses = computed(() => {
  if (props.useNativeAsset) {
    return props.pool.tokenAddresses.map(address => {
      if (address === wrappedNativeAsset.value.address)
        return nativeAsset.address;
      return address;
    });
  }

  return props.pool.tokenAddresses;
});

const fiatTotal = computed(() => {
  const fiatValue = tokenAddresses.value
    .map(address => {
      if (address === nativeAsset.address && !props.useNativeAsset) return '0';
      if (address === wrappedNativeAsset.value.address && props.useNativeAsset)
        return '0';

      const tokenBalance = balanceFor(address);
      return toFiat(tokenBalance, address);
    })
    .reduce((total, value) =>
      bnum(total)
        .plus(value)
        .toString()
    );

  return fNum(fiatValue, currency.value);
});

/**
 * METHODS
 */
function isSelectedNativeAsset(address: string): boolean {
  if (props.useNativeAsset && address === nativeAsset.address) return true;
  return !props.useNativeAsset && address === wrappedNativeAsset.value.address;
}
</script>

<template>
  <BalCard shadow="none" noPad>
    <template v-if="!hideHeader" #header>
      <div class="p-4 w-full border-b dark:border-gray-700">
        <h6>
          {{ $t('investment.myWalletTokensCard.title') }}
        </h6>
      </div>
    </template>

    <div class="-mt-3 p-4">
      <div v-for="address in pool.tokenAddresses" :key="address" class="py-3">
        <div v-if="address === wrappedNativeAsset.address">
          <div class="flex items-start justify-between">
            <BalBreakdown
              :items="[nativeAsset, wrappedNativeAsset]"
              class="w-full"
              size="lg"
            >
              <div class="flex justify-between">
                <span>{{ nativeAsset.name }} {{ $t('tokens') }}</span>
                <BalTooltip
                  :text="
                    $t(
                      'investment.myWalletTokensCard.tooltips.nativeAssetSelection',
                      [nativeAsset.symbol, wrappedNativeAsset.symbol]
                    )
                  "
                />
              </div>
              <template #item="{ item: asset }">
                <AssetRow
                  :address="asset.address"
                  :selected="isSelectedNativeAsset(asset.address)"
                  class="cursor-pointer"
                  @click="
                    emit(
                      'update:useNativeAsset',
                      asset.address === nativeAsset.address
                    )
                  "
                />
              </template>
            </BalBreakdown>
          </div>
        </div>

        <AssetRow v-else :address="address" :selected="true" />
      </div>
      <div class="pt-4 flex justify-between font-medium">
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
