import {
  buildRelayerCalls,
  SubgraphPoolBase,
  SwapInfo,
  SwapTypes,
} from '@balancer-labs/sdk';
import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import OldBigNumber from 'bignumber.js';
import { formatUnits } from '@ethersproject/units';
import { WeiPerEther as ONE, Zero } from '@ethersproject/constants';
import { captureException } from '@sentry/browser';
import { bnum } from '@/lib/utils';

import {
  computed,
  ComputedRef,
  onMounted,
  reactive,
  Ref,
  ref,
  toRefs,
  watch,
} from 'vue';

import { getBalancer } from '@/dependencies/balancer-sdk';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo } from '@/types/TokenList';

import { useTokens } from '@/providers/tokens.provider';
import useTransactions from '../useTransactions';
import useRelayerApproval, {
  RelayerType,
} from '@/composables/approvals/useRelayerApproval';
import { configService } from '@/services/config/config.service';

import { SwapQuote } from './types';
import useNumbers, { FNumFormats } from '../useNumbers';
import useEthers from '../useEthers';
import useRelayerApprovalQuery from '@/composables/queries/useRelayerApprovalQuery';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import BatchRelayerAbi from '@/lib/abi/BatchRelayer.json';

type JoinExitState = {
  validationErrors: {
    highPriceImpact: boolean;
  };
  submissionError: string | null;
};

const state = reactive<JoinExitState>({
  validationErrors: {
    highPriceImpact: false,
  },
  submissionError: null,
});

type Props = {
  exactIn: Ref<boolean>;
  tokenInAddressInput: Ref<string>;
  tokenInAmountInput: Ref<string>;
  tokenOutAddressInput: Ref<string>;
  tokenOutAmountInput: Ref<string>;
  tokenInAmountScaled: ComputedRef<BigNumber>;
  tokenOutAmountScaled: ComputedRef<BigNumber>;
  tokenIn: ComputedRef<TokenInfo>;
  tokenOut: ComputedRef<TokenInfo>;
  slippageBufferRate: ComputedRef<number>;
  pools: Ref<SubgraphPoolBase[]>;
};

export type useJoinExit = ReturnType<typeof useJoinExit>;

export default function useJoinExit({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  tokenIn,
  tokenOut,
  slippageBufferRate,
  pools,
}: Props) {
  const swapInfo = ref<SwapInfo | null>(null);
  const swapping = ref(false);
  const confirming = ref(false);
  const priceImpact = ref(0);
  const latestTxHash = ref('');
  const swapInfoLoading = ref(false);

  // COMPOSABLES
  const { account, getSigner } = useWeb3();
  const { injectTokens, getToken } = useTokens();
  const { relayerSignature } = useRelayerApproval(RelayerType.BATCH_V4);
  const relayerApprovalQuery = useRelayerApprovalQuery(
    ref(configService.network.addresses.batchRelayerV4)
  );
  const { addTransaction } = useTransactions();
  const { txListener } = useEthers();
  const { fNum2 } = useNumbers();

  const hasValidationError = computed(
    () => state.validationErrors.highPriceImpact != false
  );

  function resetState() {
    state.validationErrors.highPriceImpact = false;

    state.submissionError = null;
  }

  function resetInputAmounts(amount: string): void {
    tokenInAmountInput.value = amount;
    tokenOutAmountInput.value = amount;
    priceImpact.value = 0;
  }

  async function getSwapInfo(): Promise<void> {
    swapInfoLoading.value = true;
    swapInfo.value = await getBalancer().sor.getSwaps(
      tokenInAddressInput.value,
      tokenOutAddressInput.value,
      exactIn.value ? SwapTypes.SwapExactIn : SwapTypes.SwapExactOut,
      parseFixed(
        tokenInAmountInput.value || tokenOutAmountInput.value || '0',
        18
      ),
      undefined,
      true
    );
    swapInfoLoading.value = false;
  }

  async function handleAmountChange(): Promise<void> {
    // Prevent quering undefined input amounts
    if (
      (exactIn.value && !tokenInAmountInput.value) ||
      (!exactIn.value && !tokenOutAmountInput.value)
    ) {
      return;
    }

    if (pools.value.length === 0) return;

    const amountToExchange = exactIn.value
      ? tokenInAmountScaled.value
      : tokenOutAmountScaled.value;

    if (amountToExchange === undefined) {
      return;
    }

    if (amountToExchange.isZero()) {
      tokenInAmountInput.value = '0';
      tokenOutAmountInput.value = '0';
      return;
    }

    await getSwapInfo();

    const tokenInDecimals = getTokenDecimals(tokenInAddressInput.value);
    const tokenOutDecimals = getTokenDecimals(tokenOutAddressInput.value);

    const returnAmount = swapInfo.value?.returnAmount || BigNumber.from('0');

    if (returnAmount.isZero()) return;

    if (exactIn.value) {
      tokenOutAmountInput.value = bnum(
        formatUnits(returnAmount, tokenOutDecimals)
      ).toFixed(6, OldBigNumber.ROUND_DOWN);
    } else {
      tokenInAmountInput.value = bnum(
        formatUnits(returnAmount, tokenInDecimals)
      ).toFixed(6, OldBigNumber.ROUND_DOWN);
    }
  }

  async function swap(successCallback?: () => void) {
    const balancer = getBalancer();
    try {
      confirming.value = true;
      state.submissionError = null;

      if (!swapInfo.value) {
        return;
      }

      const relayerCallData = buildRelayerCalls(
        swapInfo.value,
        pools.value,
        account.value,
        balancer.contracts.relayerV4?.address ?? '',
        balancer.networkConfig.addresses.tokens.wrappedNativeAsset,
        String(slippageBufferRate.value * 1e4),
        relayerSignature.value || undefined
      );

      const txBuilder = new TransactionBuilder(getSigner());
      const tx = await txBuilder.contract.sendTransaction({
        contractAddress: balancer.contracts.relayerV4?.address ?? '',
        abi: BatchRelayerAbi,
        action: 'multicall',
        params: [relayerCallData.rawCalls],
      });
      console.log(tx);

      const tokenInAmountFormatted = fNum2(tokenInAmountInput.value, {
        ...FNumFormats.token,
        maximumSignificantDigits: 6,
      });
      const tokenOutAmountFormatted = fNum2(tokenOutAmountInput.value, {
        ...FNumFormats.token,
        maximumSignificantDigits: 6,
      });

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'swap',
        summary: `${tokenInAmountFormatted} ${tokenIn.value.symbol} -> ${tokenOutAmountFormatted} ${tokenOut.value.symbol}`,
        details: {
          tokenIn: tokenIn.value,
          tokenOut: tokenOut.value,
          tokenInAddress: tokenInAddressInput.value,
          tokenOutAddress: tokenOutAddressInput.value,
          tokenInAmount: tokenInAmountInput.value,
          tokenOutAmount: tokenOutAmountInput.value,
          exactIn: exactIn.value,
          quote: getQuote(),
          priceImpact: priceImpact.value,
          slippageBufferRate: slippageBufferRate.value,
        },
      });

      if (successCallback != null) {
        successCallback();
      }

      await txListener(tx, {
        onTxConfirmed: () => {
          confirming.value = false;
          relayerApprovalQuery.refetch.value();
        },
        onTxFailed: () => {
          confirming.value = false;
        },
      });
    } catch (e) {
      console.log(e);
      captureException(e);
      state.submissionError = (e as Error).message;
      swapping.value = false;
      confirming.value = false;
    }
  }

  function getMaxIn(amount: BigNumber) {
    return amount
      .mul(parseFixed(String(1 + slippageBufferRate.value), 18))
      .div(ONE);
  }

  function getMinOut(amount: BigNumber) {
    return amount
      .mul(ONE)
      .div(parseFixed(String(1 + slippageBufferRate.value), 18));
  }

  function getQuote(): SwapQuote {
    const maximumInAmount =
      tokenInAmountScaled != null ? getMaxIn(tokenInAmountScaled.value) : Zero;

    const minimumOutAmount =
      tokenOutAmountScaled != null
        ? getMinOut(tokenOutAmountScaled.value)
        : Zero;

    return {
      feeAmountInToken: '0',
      feeAmountOutToken: '0',
      maximumInAmount,
      minimumOutAmount,
    };
  }

  function getTokenDecimals(tokenAddress: string) {
    return getToken(tokenAddress)?.decimals;
  }

  // LIFECYCLE
  onMounted(async () => {
    const unknownAssets: string[] = [];
    if (tokenInAddressInput.value && !getToken(tokenInAddressInput.value)) {
      unknownAssets.push(tokenInAddressInput.value);
    }
    if (tokenOutAddressInput.value && !getToken(tokenOutAddressInput.value)) {
      unknownAssets.push(tokenOutAddressInput.value);
    }
    await injectTokens(unknownAssets);
  });

  watch(pools, () => {
    handleAmountChange();
  });

  return {
    ...toRefs(state),
    pools,
    hasValidationError,
    handleAmountChange,
    exactIn,
    swap,
    swapInfo,
    swapping,
    priceImpact,
    latestTxHash,
    getQuote,
    resetState,
    confirming,
    swapInfoLoading,
    resetInputAmounts,
  };
}
