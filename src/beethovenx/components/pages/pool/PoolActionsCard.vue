<script setup lang="ts">
import { toRef, onBeforeMount, computed } from 'vue';
import useWithdrawMath from '@/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { getAddress } from '@ethersproject/address';

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
const { initMath, hasBpt } = useWithdrawMath(toRef(props, 'pool'));
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { isWalletReady, toggleWalletSelectModal } = useWeb3();

/**
 * COMPUTED
 */
const fiatTotal = computed(() => {
  const fiatValue = props.pool.tokenAddresses
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

  return fNum(fiatValue, currency.value);
});

const hasUnstakedBpt = computed(
  () =>
    props.pool.farm &&
    parseFloat(balanceFor(getAddress(props.pool.address))) > 0
);

const hasFarm = computed(() => !!props.pool.farm);

const hasFarmStake = computed(
  () => props.pool.farm?.stake && props.pool.farm.stake > 0
);

const farmId = computed(() => props.pool.farm?.id || '');
const tokenAddress = computed(() => props.pool.address);

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  initMath();
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
    <BalBtn
      v-if="hasFarm"
      class="mt-2"
      :tag="hasFarmStake || hasUnstakedBpt ? 'router-link' : 'div'"
      :to="{ name: 'farm', params: { id: farmId, tokenAddress } }"
      label="Farm"
      :disabled="!hasFarmStake && !hasUnstakedBpt"
      block
    />
    <BalAlert
      v-if="hasUnstakedBpt"
      title="You have unstaked BPT in your wallet"
      description="If you deposit your BPT into the farm, you will earn additional rewards paid out in BEETS."
      type="warning"
      size="sm"
      class="mt-2"
    />
  </BalCard>
</template>
