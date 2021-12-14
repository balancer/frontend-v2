<script setup lang="ts">
import { computed } from 'vue';
import { formatUnits } from '@ethersproject/units';

import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import useUserSettings from '@/composables/useUserSettings';

import useWeb3 from '@/services/web3/useWeb3';

import { bnum } from '@/lib/utils';

/**
 * TYPES
 */
type Props = {
  mainTokenAddress?: string;
  priceRate?: string;
  address: string;
  balance: string;
  share: string;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { fNum, toFiat } = useNumbers();
const { currency } = useUserSettings();
const { explorerLinks } = useWeb3();

/**
 * COMPUTED
 */
const token = computed(() => getToken(props.address));

const balance = computed(() => {
  const formattedBalance = formatUnits(props.balance, token.value.decimals);
  return props.share != null
    ? bnum(formattedBalance)
        .times(props.share)
        .toString()
    : formattedBalance;
});

const balanceLabel = computed(() => fNum(balance.value, 'token'));

const fiatLabel = computed(() => {
  let fiatValue = toFiat(
    balance.value,
    props.mainTokenAddress ?? props.address
  );

  if (props.priceRate != null) {
    fiatValue = bnum(fiatValue)
      .times(props.priceRate)
      .toString();
  }

  return fNum(fiatValue, currency.value);
});
</script>

<template>
  <div class="grid grid-cols-3">
    <div>
      <BalLink
        :href="explorerLinks.addressLink(token.address)"
        external
        noStyle
        class="flex items-center"
      >
        <BalAsset :address="token.address" class="mr-2" />
        {{ token.symbol }}
        <BalIcon
          name="arrow-up-right"
          size="sm"
          class="ml-2 text-gray-500 hover:text-blue-500 transition-colors"
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
