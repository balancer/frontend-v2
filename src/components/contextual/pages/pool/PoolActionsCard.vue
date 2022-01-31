<script setup lang="ts">
import { toRef, computed } from 'vue';
import useWithdrawMath from '@/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { lpTokensFor } from '@/composables/usePool';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  missingPrices: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { hasBpt } = useWithdrawMath(toRef(props, 'pool'));
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { fNum2, toFiat } = useNumbers();
const { isWalletReady, toggleWalletSelectModal } = useWeb3();

/**
 * COMPUTED
 */
const fiatTotal = computed(() => {
  const fiatValue = lpTokensFor(props.pool)
    .map(address => {
      let tokenBalance = '0';

      if (address === wrappedNativeAsset.value.address) {
        const wrappedBalance = balanceFor(address);
        const nativeBalance = balanceFor(nativeAsset.address);
        tokenBalance = bnum(nativeBalance).gt(wrappedBalance)
          ? nativeBalance
          : wrappedBalance;
      } else {
        tokenBalance = balanceFor(address);
      }

      return toFiat(tokenBalance, address);
    })
    .reduce((total, value) =>
      bnum(total)
        .plus(value)
        .toString()
    );

  return fNum2(fiatValue, FNumFormats.fiat);
});
</script>

<template>
  <BalCard>
    <div class="text-gray-500 text-sm">
      {{ $t('basedOnTokensInWallet') }}
    </div>
    <div class="flex justify-between items-center mb-4">
      <h5>
        {{ $t('youCanInvest') }}
      </h5>
      <h5>
        {{ isWalletReady ? fiatTotal : '-' }}
      </h5>
    </div>

    <BalBtn
      v-if="!isWalletReady"
      :label="$t('connectWallet')"
      color="gradient"
      block
      @click="toggleWalletSelectModal"
    />
    <div v-else class="grid gap-2 grid-cols-2">
      <BalBtn
        tag="router-link"
        :to="{ name: 'invest' }"
        :label="$t('invest')"
        color="gradient"
        block
      />
      <BalBtn
        :tag="hasBpt ? 'router-link' : 'div'"
        :to="{ name: 'withdraw' }"
        :label="$t('withdraw.label')"
        :disabled="!hasBpt"
        block
      />
    </div>
  </BalCard>
</template>
