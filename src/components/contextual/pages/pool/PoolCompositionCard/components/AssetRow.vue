<script setup lang="ts">
import { formatUnits, parseUnits } from '@ethersproject/units';
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import { PoolToken } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  mainTokenAddress?: string;
  poolToken: PoolToken;
  share: string | null;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { fNum2, toFiat } = useNumbers();
const { explorerLinks } = useWeb3();

/**
 * COMPUTED
 */
const tokenInfo = computed(() => getToken(props.poolToken.address));

const balance = computed(() => {
  const formattedBalance = formatUnits(
    parseUnits(props.poolToken.balance, props.poolToken.decimals).toString(),
    tokenInfo.value.decimals
  );
  return props.share != null
    ? bnum(formattedBalance).times(props.share).toString()
    : formattedBalance;
});

const balanceLabel = computed(() => {
  if (props.poolToken.priceRate && props.mainTokenAddress) {
    const equivMainTokenBalance = bnum(balance.value)
      .times(props.poolToken.priceRate)
      .toString();

    return fNum2(equivMainTokenBalance, FNumFormats.token);
  }

  return fNum2(balance.value, FNumFormats.token);
});

const fiatLabel = computed(() => {
  if (props.poolToken.priceRate && props.mainTokenAddress) {
    const equivMainTokenBalance = bnum(balance.value)
      .times(props.poolToken.priceRate)
      .toString();

    const fiatValue = toFiat(equivMainTokenBalance, props.mainTokenAddress);
    return fNum2(fiatValue, FNumFormats.fiat);
  }

  let fiatValue = toFiat(balance.value, props.poolToken.address);
  return fNum2(fiatValue, FNumFormats.fiat);
});
</script>

<template>
  <div class="grid grid-cols-3">
    <div>
      <BalLink
        :href="explorerLinks.addressLink(tokenInfo.address)"
        external
        noStyle
        class="flex items-center"
      >
        <BalAsset :address="tokenInfo.address" class="mr-2" />
        {{ tokenInfo.symbol }}
        <BalIcon
          name="arrow-up-right"
          size="sm"
          class="ml-2 hover:text-blue-500 transition-colors text-secondary"
        />
      </BalLink>
    </div>

    <div class="justify-self-end">
      {{ balanceLabel }}
    </div>

    <div class="justify-self-end">
      {{ fiatLabel }}
    </div>
  </div>
</template>
