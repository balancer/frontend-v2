<script setup lang="ts">
import { computed, toRef } from 'vue';
import { bnum } from '@/lib/utils';
import { FullPool } from '@/services/balancer/subgraph/types';
// Composables
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import useTokens from '@/composables/useTokens';
// Components
import AssetRow from './components/AssetRow.vue';
import { useRoute } from 'vue-router';
import { usePool } from '@/composables/usePool';

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
const { isWethPool } = usePool(toRef(props, 'pool'));
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const route = useRoute();

/**
 * COMPUTED
 */
const pageContext = computed(() => route.name);

const tokenAddresses = computed(() => {
  if (pageContext.value === 'invest' && props.useNativeAsset) {
    return props.pool.tokenAddresses.map(address => {
      if (address === wrappedNativeAsset.value.address)
        return nativeAsset.address;
      return address;
    });
  } else if (pageContext.value === 'withdraw' && isWethPool.value) {
    return [nativeAsset.address, ...props.pool.tokenAddresses];
  }

  return props.pool.tokenAddresses;
});

const fiatTotal = computed(() => {
  const fiatValue = tokenAddresses.value
    .map(address => {
      if (pageContext.value === 'invest') {
        if (address === nativeAsset.address && !props.useNativeAsset)
          return '0';
        if (
          address === wrappedNativeAsset.value.address &&
          props.useNativeAsset
        )
          return '0';
      }

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
  if (pageContext.value === 'withdraw') return true;
  if (props.useNativeAsset && address === nativeAsset.address) return true;

  return !props.useNativeAsset && address === wrappedNativeAsset.value.address;
}
</script>

<template>
  <BalCard shadow="none" noPad>
    <template v-if="!hideHeader" #header>
      <div class="p-4 w-full shadow-lg">
        <h6>
          {{ $t('poolTransfer.myWalletTokensCard.title') }}
        </h6>
      </div>
    </template>

    <div class="-mt-2 p-4">
      <div v-for="address in pool.tokenAddresses" :key="address" class="py-2">
        <div v-if="address === wrappedNativeAsset.address">
          <div class="flex items-start justify-between">
            <BalBreakdown
              :items="[nativeAsset, wrappedNativeAsset]"
              class="w-full"
              size="lg"
            >
              <div class="flex justify-between">
                <span>
                  {{ nativeAsset.name }}
                  <span class="lowercase">{{ $t('tokens') }}</span>
                </span>
                <BalTooltip
                  v-if="pageContext === 'invest'"
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
