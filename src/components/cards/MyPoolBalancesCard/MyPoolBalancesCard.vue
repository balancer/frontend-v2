<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
// Composables
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import PoolCalculator from '@/services/pool/calculator/calculator.sevice';
import { Pool } from '@/services/pool/types';

// Components
import AssetRow from './components/AssetRow.vue';
import useStaking from '@/composables/staking/useStaking';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  hideHeader?: boolean;
};
/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  hideHeader: false,
});

/**
 * COMPOSABLES
 */
const { tokens, balances, balanceFor } = useTokens();
const { fNum2, toFiat } = useNumbers();
const { isDeepPool } = usePool(toRef(props, 'pool'));
const {
  userData: { stakedSharesForProvidedPool },
} = useStaking();

/**
 * SERVICES
 */
const poolCalculator = new PoolCalculator(
  toRef(props, 'pool'),
  tokens,
  balances,
  'exit',
  ref(false)
);

/**
 * COMPUTED
 */
const bptBalance = computed((): string => balanceFor(props.pool.address));

const propTokenAmounts = computed((): string[] => {
  const { receive } = poolCalculator.propAmountsGiven(
    bnum(bptBalance.value).plus(stakedSharesForProvidedPool.value).toString(),
    0,
    'send'
  );

  if (isDeepPool.value) {
    // Return linear pool's main token balance using the price rate.
    // mainTokenBalance = linearPoolBPT * priceRate
    return props.pool.tokensList.map((address, i) => {
      if (!props.pool?.onchain?.linearPools) return '0';

      const priceRate = props.pool.onchain.linearPools[address].priceRate;

      return bnum(receive[i]).times(priceRate).toString();
    });
  }

  return receive;
});

const tokenAddresses = computed((): string[] => {
  if (isDeepPool.value) {
    // We're using mainToken balances for StablePhantom pools
    // so return mainTokens here so that fiat values are correct.
    return props.pool.mainTokens || [];
  }
  return props.pool.tokensList;
});

const fiatTotal = computed(() => {
  const fiatValue = tokenAddresses.value
    .map((address, i) => toFiat(propTokenAmounts.value[i], address))
    .reduce((total, value) => bnum(total).plus(value).toString());
  return fNum2(fiatValue, FNumFormats.fiat);
});
</script>
  
  <template>
  <BalCard shadow="none" noPad>
    <template v-if="!hideHeader" #header>
      <div class="p-4 w-full border-b dark:border-gray-900">
        <h6>
          {{ $t('poolTransfer.myPoolBalancesCard.title') }}
        </h6>
      </div>
    </template>

    <div class="p-4 -mt-2">
      <div v-for="(address, i) in tokenAddresses" :key="address" class="py-2">
        <AssetRow :address="address" :balance="propTokenAmounts[i]" />
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
  