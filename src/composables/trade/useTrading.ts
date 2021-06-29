import { ETHER } from '@/constants/tokenlists';
import { bnum, scale } from '@/lib/utils';
import { computed, Ref } from 'vue';
import { useStore } from 'vuex';
import useNumbers from '../useNumbers';
import useTokens from '../useTokens';

export default function useTrading(
  tokenInAddress: Ref<string>,
  tokenInAmount: Ref<string>,
  tokenOutAddress: Ref<string>,
  tokenOutAmount: Ref<string>
) {
  // COMPOSABLES
  const store = useStore();
  const { fNum } = useNumbers();
  const { allTokensIncludeEth: tokens } = useTokens();

  const tokenIn = computed(() => tokens.value[tokenInAddress.value]);
  const tokenOut = computed(() => tokens.value[tokenOutAddress.value]);

  // METHODS
  function getConfig() {
    return store.getters['web3/getConfig']();
  }

  // COMPUTED
  const isWrap = computed(() => {
    const config = getConfig();
    return (
      tokenInAddress.value === ETHER.address &&
      tokenOutAddress.value === config.addresses.weth
    );
  });

  const isUnwrap = computed(() => {
    const config = getConfig();
    return (
      tokenOutAddress.value === ETHER.address &&
      tokenInAddress.value === config.addresses.weth
    );
  });

  const isEthTrade = computed(() => tokenInAddress.value === ETHER.address);

  const tokenInAmountScaled = computed(() =>
    scale(bnum(tokenInAmount.value), tokenIn.value.decimals)
  );

  const tokenOutAmountScaled = computed(() =>
    scale(bnum(tokenOutAmount.value), tokenOut.value.decimals)
  );

  const requiresApproval = computed(() => {
    if (isWrap.value || isUnwrap.value || isEthTrade.value) {
      return false;
    }
    return true;
  });

  const effectivePriceMessage = computed(() => ({
    tokenIn: `1 ${tokenIn.value?.symbol} = ${fNum(
      tokenOutAmountScaled.value.div(tokenInAmountScaled.value).toString(),
      'token'
    )} ${tokenOut.value?.symbol}`,
    tokenOut: `1 ${tokenOut.value?.symbol} = ${fNum(
      tokenInAmountScaled.value.div(tokenOutAmountScaled.value).toString(),
      'token'
    )} ${tokenIn.value?.symbol}`
  }));

  return {
    // methods
    getConfig,

    // computed
    isWrap,
    isUnwrap,
    isEthTrade,
    tokenIn,
    tokenOut,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokens,
    requiresApproval,
    effectivePriceMessage
  };
}
