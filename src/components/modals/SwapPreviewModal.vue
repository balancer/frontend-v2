<script setup lang="ts">
import { SubgraphPoolBase } from '@balancer-labs/sdk';
import { formatUnits } from '@ethersproject/units';
import { mapValues } from 'lodash';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import SwapRoute from '@/components/cards/SwapCard/SwapRoute.vue';
import { SwapQuote } from '@/composables/swap/types';
import useRelayerApproval, {
  RelayerType,
} from '@/composables/approvals/useRelayerApproval';
import useRelayerApprovalTx from '@/composables/approvals/useRelayerApprovalTx';
import useTokenApproval from '@/composables/approvals/useTokenApproval';
import { UseSwapping } from '@/composables/swap/useSwapping';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { useUserSettings } from '@/providers/user-settings.provider';
import { FiatCurrency } from '@/constants/currency';
import { bnum, bnumZero } from '@/lib/utils';
import { isStETH } from '@/lib/utils/balancer/lido';
import { getWrapAction, WrapType } from '@/lib/utils/balancer/wrapper';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';
import { TransactionResponse } from '@ethersproject/abstract-provider';

const PRICE_UPDATE_THRESHOLD = 0.02;

type Props = {
  swapping: UseSwapping;
  error?: any;
  warning?: any;
};

/**
 * PROPS & EMITS
 */

const props = defineProps<Props>();

const emit = defineEmits(['swap', 'close']);
// COMPOSABLES
const { t } = useI18n();
const { fNum2, toFiat } = useNumbers();
const { tokens, balanceFor, approvalRequired } = useTokens();
const {
  relayerSignature: batchRelayerSignature,
  relayerApprovalAction: batchRelayerApprovalAction,
} = useRelayerApproval(RelayerType.BATCH_V4);
const { isUnlocked: batchRelayerIsUnlocked } = useRelayerApprovalTx(
  RelayerType.BATCH_V4
);
const { blockNumber, account, startConnectWithInjectedProvider } = useWeb3();
const { slippage } = useUserSettings();

// state
const lastQuote = ref<SwapQuote | null>(
  props.swapping.isWrapUnwrapSwap.value ? null : props.swapping.getQuote()
);
const priceUpdated = ref(false);
const priceUpdateAccepted = ref(false);

// DATA
const showSummaryInFiat = ref(false);

// COMPUTED
const slippageRatePercent = computed(() =>
  fNum2(slippage.value, FNumFormats.percent)
);

const addressIn = computed(() => props.swapping.tokenIn.value.address);

const tokenInFiatValue = computed(() =>
  fNum2(
    toFiat(
      props.swapping.tokenInAmountInput.value,
      props.swapping.tokenIn.value.address
    ),
    FNumFormats.fiat
  )
);

const tokenOutFiatValue = computed(() =>
  fNum2(
    toFiat(
      props.swapping.tokenOutAmountInput.value,
      props.swapping.tokenOut.value.address
    ),
    FNumFormats.fiat
  )
);

const showSwapRoute = computed(() => props.swapping.isBalancerSwap.value);

const zeroFee = computed(() =>
  showSummaryInFiat.value ? fNum2('0', FNumFormats.fiat) : '0.0 ETH'
);

const exceedsBalance = computed(() => {
  return (
    account.value &&
    bnum(props.swapping.tokenInAmountInput.value).isGreaterThan(
      balanceFor(props.swapping.tokenInAddressInput.value)
    )
  );
});

const disableSubmitButton = computed(() => {
  return !!exceedsBalance.value || !!props.error;
});

const summary = computed(() => {
  const summaryItems = {
    amountBeforeFees: '',
    swapFees: '',
    totalWithoutSlippage: '',
    totalWithSlippage: '',
  };

  const exactIn = props.swapping.exactIn.value;

  const tokenIn = props.swapping.tokenIn.value;
  const tokenOut = props.swapping.tokenOut.value;

  const tokenInAmountInput = props.swapping.tokenInAmountInput.value;
  const tokenOutAmountInput = props.swapping.tokenOutAmountInput.value;

  if (props.swapping.isWrapUnwrapSwap.value) {
    summaryItems.amountBeforeFees = tokenOutAmountInput;
    summaryItems.swapFees = '0';
    summaryItems.totalWithoutSlippage = tokenOutAmountInput;
    summaryItems.totalWithSlippage = tokenOutAmountInput;
  } else {
    const quote = props.swapping.getQuote();

    if (exactIn) {
      summaryItems.amountBeforeFees = tokenOutAmountInput;
      summaryItems.swapFees = formatUnits(
        quote.feeAmountOutToken,
        tokenOut.decimals
      );
      summaryItems.totalWithoutSlippage = bnum(summaryItems.amountBeforeFees)
        .minus(summaryItems.swapFees)
        .toString();
      summaryItems.totalWithSlippage = formatUnits(
        quote.minimumOutAmount,
        tokenOut.decimals
      );
    } else {
      summaryItems.amountBeforeFees = tokenInAmountInput;
      summaryItems.swapFees = formatUnits(
        quote.feeAmountInToken,
        tokenIn.decimals
      );
      summaryItems.totalWithoutSlippage = bnum(summaryItems.amountBeforeFees)
        .plus(summaryItems.swapFees)
        .toString();
      summaryItems.totalWithSlippage = formatUnits(
        quote.maximumInAmount,
        tokenIn.decimals
      );
    }
  }

  if (showSummaryInFiat.value) {
    return mapValues(
      summaryItems,
      itemValue =>
        `${fNum2(
          toFiat(itemValue, exactIn ? tokenOut.address : tokenIn.address),
          FNumFormats.fiat
        )}`
    );
  } else {
    return mapValues(
      summaryItems,
      itemValue =>
        `${fNum2(itemValue, FNumFormats.token)} ${
          exactIn || props.swapping.isWrapUnwrapSwap.value
            ? tokenOut.symbol
            : tokenIn.symbol
        }`
    );
  }
});

const labels = computed(() => {
  if (props.swapping.isWrap.value) {
    return {
      modalTitle: t('previewWrap', [props.swapping.tokenIn.value.symbol]),
      confirmSwap: t('confirmWrap', [props.swapping.tokenIn.value.symbol]),
      swapSummary: {
        title: t('swapSummary.wrap.title'),
        swapFees: t('swapSummary.wrap.swapFees'),
        totalBeforeFees: t('swapSummary.wrap.totalBeforeFees'),
        totalAfterFees: t('swapSummary.wrap.totalAfterFees'),
        totalWithSlippage: t('swapSummary.wrap.totalWithSlippage', [
          props.swapping.tokenIn.value.symbol,
        ]),
      },
    };
  } else if (props.swapping.isUnwrap.value) {
    return {
      modalTitle: t('previewUnwrap', [props.swapping.tokenOut.value.symbol]),
      confirmSwap: t('confirmUnwrap', [props.swapping.tokenOut.value.symbol]),
      swapSummary: {
        title: t('swapSummary.unwrap.title'),
        swapFees: t('swapSummary.unwrap.swapFees'),
        totalBeforeFees: t('swapSummary.unwrap.totalBeforeFees'),
        totalAfterFees: t('swapSummary.unwrap.totalAfterFees'),
        totalWithSlippage: t('swapSummary.unwrap.totalWithSlippage', [
          props.swapping.tokenOut.value.symbol,
        ]),
      },
    };
  } else if (props.swapping.exactIn.value) {
    return {
      modalTitle: t('previewSwap'),
      confirmSwap: t('confirmSwap'),
      swapSummary: {
        title: t('swapSummary.exactIn.title', [
          props.swapping.tokenIn.value.symbol,
        ]),
        swapFees: t('swapSummary.exactIn.swapFees'),
        totalBeforeFees: t('swapSummary.exactIn.totalBeforeFees'),
        totalAfterFees: t('swapSummary.exactIn.totalAfterFees'),
        totalWithSlippage: t('swapSummary.exactIn.totalWithSlippage', [
          slippageRatePercent.value,
        ]),
      },
    };
  }
  // exact out
  return {
    modalTitle: t('previewSwap'),
    confirmSwap: t('confirmSwap'),
    swapSummary: {
      title: t('swapSummary.exactOut.title', [
        props.swapping.tokenOut.value.symbol,
      ]),
      swapFees: t('swapSummary.exactOut.swapFees'),
      totalBeforeFees: t('swapSummary.exactOut.totalBeforeFees'),
      totalAfterFees: t('swapSummary.exactOut.totalAfterFees'),
      totalWithSlippage: t('swapSummary.exactOut.totalWithSlippage', [
        slippageRatePercent.value,
      ]),
    },
  };
});

const tokenApproval = useTokenApproval(
  addressIn,
  props.swapping.tokenInAmountInput,
  tokens
);

const cowswapRelayerApproval = useRelayerApprovalTx(
  RelayerType.COWSWAP,
  props.swapping.isCowswapSwap
);

const pools = computed<SubgraphPoolBase[]>(() => {
  return props.swapping.sor.pools.value;
});

const wrapType = computed(() =>
  getWrapAction(
    props.swapping.tokenIn.value.address,
    props.swapping.tokenOut.value.address
  )
);

const isStETHSwap = computed(
  () =>
    isStETH(addressIn.value, props.swapping.tokenOut.value.address) &&
    wrapType.value === WrapType.NonWrap
);

const lidoRelayerApproval = useRelayerApprovalTx(RelayerType.LIDO, isStETHSwap);

const requiresTokenApproval = computed(() => {
  if (props.swapping.isWrap.value && !props.swapping.isEthSwap.value) {
    return approvalRequired(
      props.swapping.tokenIn.value.address,
      props.swapping.tokenInAmountInput.value,
      props.swapping.tokenOut.value.address
    );
  } else if (props.swapping.requiresTokenApproval.value) {
    return !tokenApproval.isUnlockedV2.value;
  }
  return false;
});

const requiresBatchRelayerApproval = computed(
  () =>
    props.swapping.isJoinExitSwap.value &&
    !batchRelayerIsUnlocked.value &&
    !batchRelayerSignature.value
);

const requiresCowswapRelayerApproval = computed(
  () =>
    props.swapping.isCowswapSwap.value &&
    props.swapping.requiresTokenApproval.value &&
    !cowswapRelayerApproval.isUnlocked.value
);

const requiresLidoRelayerApproval = computed(
  () =>
    props.swapping.isBalancerSwap.value && !lidoRelayerApproval.isUnlocked.value
);

const showTokenApprovalStep = computed(
  () =>
    requiresTokenApproval.value ||
    tokenApproval.approved.value ||
    tokenApproval.approving.value
);

const showBatchRelayerApprovalStep = computed(
  () => props.swapping.isJoinExitSwap.value && !batchRelayerIsUnlocked.value
);

const showCowswapRelayerApprovalStep = computed(
  () =>
    requiresCowswapRelayerApproval.value ||
    cowswapRelayerApproval.init.value ||
    cowswapRelayerApproval.approved.value ||
    cowswapRelayerApproval.approving.value
);

const showLidoRelayerApprovalStep = computed(
  () =>
    !props.swapping.isJoinExitSwap.value &&
    (requiresLidoRelayerApproval.value ||
      lidoRelayerApproval.init.value ||
      lidoRelayerApproval.approved.value ||
      lidoRelayerApproval.approving.value)
);

const requiresApproval = computed(
  () =>
    requiresBatchRelayerApproval.value ||
    requiresCowswapRelayerApproval.value ||
    requiresLidoRelayerApproval.value ||
    requiresTokenApproval.value
);

const showPriceUpdateError = computed(
  () =>
    !requiresApproval.value && priceUpdated.value && !priceUpdateAccepted.value
);

const actionStepsLoading = computed(
  () =>
    cowswapRelayerApproval.init.value ||
    cowswapRelayerApproval.approving.value ||
    lidoRelayerApproval.init.value ||
    lidoRelayerApproval.approving.value ||
    tokenApproval.approving.value ||
    props.swapping.isConfirming.value
);

const actionStepsLoadingLabel = computed(() =>
  requiresCowswapRelayerApproval.value
    ? `${t('approvingCowswapRelayer')}...`
    : requiresLidoRelayerApproval.value
    ? `${t('approvingLidoRelayer')}...`
    : requiresBatchRelayerApproval.value
    ? `${t('approvingBatchRelayer')}...`
    : requiresTokenApproval.value
    ? `${t('approving')} ${props.swapping.tokenIn.value.symbol}...`
    : t('confirming')
);

const actions = computed((): TransactionActionInfo[] => [
  ...(showCowswapRelayerApprovalStep.value
    ? [
        {
          label: t('approveCowswapRelayer'),
          loadingLabel: t('approvingCowswapRelayer'),
          confirmingLabel: t('approveCowswapRelayer'),
          action: cowswapRelayerApproval.approve,
          stepTooltip: t(
            'swapSummary.transactionTypesTooltips.cowswapRelayerApproval.content'
          ),
        },
      ]
    : []),
  ...(showLidoRelayerApprovalStep.value
    ? [
        {
          label: t('approveLidoRelayer'),
          loadingLabel: t('approvingLidoRelayer'),
          confirmingLabel: t('approveLidoRelayer'),
          action: lidoRelayerApproval.approve,
          stepTooltip: t(
            'swapSummary.transactionTypesTooltips.lidoRelayerApproval.content'
          ),
        },
      ]
    : []),
  ...(showBatchRelayerApprovalStep.value
    ? [batchRelayerApprovalAction.value]
    : []),
  ...(showTokenApprovalStep.value
    ? [
        {
          label: `${t('approve')} ${props.swapping.tokenIn.value.symbol}`,
          loadingLabel: `${t('approving')} ${
            props.swapping.tokenIn.value.symbol
          }...`,
          confirmingLabel: `${t('confirming')} ${
            props.swapping.tokenIn.value.symbol
          }`,
          action: approveToken,
          stepTooltip: t(
            'swapSummary.transactionTypesTooltips.tokenApproval.content'
          ),
        },
      ]
    : []),
  {
    label: labels.value.confirmSwap,
    loadingLabel: `${t('approving')} ${props.swapping.tokenIn.value.symbol}...`,
    confirmingLabel: t('confirming'),
    action: swap as () => Promise<any>,
    stepTooltip:
      props.swapping.isCowswapSwap.value && !props.swapping.isJoinExitSwap
        ? t('swapSummary.transactionTypesTooltips.sign.content')
        : t('swapSummary.transactionTypesTooltips.swap.content'),
  },
]);

// METHODS
function swap() {
  emit('swap');
}

function onClose() {
  emit('close');
}

function cofirmPriceUpdate() {
  priceUpdated.value = false;
  priceUpdateAccepted.value = true;
  lastQuote.value = props.swapping.getQuote();
}

function handlePriceUpdate() {
  if (lastQuote.value != null) {
    const newQuote = props.swapping.getQuote();

    /**
     * The bignumber returned via the quotes for some reason throw underflow
     * errors when attempting to use the gt function with the threshold value.
     * For that reason, the price difference has to be cast to our bignumber type.
     */
    if (props.swapping.exactIn.value) {
      const lastQuoteMin = bnum(lastQuote.value.minimumOutAmount.toString());
      const newQuoteMin = bnum(newQuote.minimumOutAmount.toString());
      if (lastQuoteMin.eq(bnumZero)) {
        if (newQuoteMin.eq(bnumZero)) {
          priceUpdated.value = false;
        } else {
          priceUpdated.value = true;
        }
      } else {
        const priceDiff = lastQuoteMin
          .minus(newQuoteMin)
          .abs()
          .div(lastQuoteMin);

        priceUpdated.value = priceDiff.gt(PRICE_UPDATE_THRESHOLD);
      }
    } else {
      const lastQuoteMax = bnum(lastQuote.value.maximumInAmount.toString());
      const newQuoteMax = bnum(newQuote.maximumInAmount.toString());
      if (lastQuoteMax.eq(bnumZero)) {
        if (newQuoteMax.eq(bnumZero)) {
          priceUpdated.value = false;
        } else {
          priceUpdated.value = true;
        }
      } else {
        const priceDiff = lastQuoteMax
          .minus(newQuoteMax)
          .abs()
          .div(lastQuoteMax);

        priceUpdated.value = priceDiff.gt(PRICE_UPDATE_THRESHOLD);
      }
    }

    if (priceUpdated.value) {
      priceUpdateAccepted.value = false;
    }
  }
}

async function approveToken(): Promise<TransactionResponse> {
  if (props.swapping.isWrap.value && !props.swapping.isEthSwap.value) {
    // If we're wrapping a token other than native ETH
    // we need to approve the underlying on the wrapper
    return tokenApproval.approveSpender(props.swapping.tokenOut.value.address);
  } else {
    return tokenApproval.approveV2();
  }
}

// WATCHERS
watch(blockNumber, () => {
  handlePriceUpdate();
});
</script>

<template>
  <BalModal show @close="onClose">
    <div>
      <BalStack horizontal align="center" spacing="xs" class="mb-4">
        <button class="flex text-blue-500 hover:text-blue-700" @click="onClose">
          <BalIcon class="flex" name="chevron-left" />
        </button>
        <h4>
          {{ labels.modalTitle }}
        </h4>
      </BalStack>
      <BalCard noPad class="overflow-auto relative mb-6">
        <template #header>
          <div class="w-full">
            <div>
              <BalAlert
                v-if="error"
                class="p-3 mb-2"
                type="error"
                size="sm"
                :title="error.header"
                :description="error.body"
                :actionLabel="error.label"
                block
              />
              <BalAlert
                v-else-if="warning"
                class="p-3 mb-2"
                type="warning"
                size="sm"
                :title="warning.header"
                :description="warning.body"
                block
              />
            </div>
            <div
              class="p-3 w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b dark:border-gray-800"
            >
              <span>
                {{ $t('effectivePrice') }}
                {{
                  swapping.exactIn.value
                    ? swapping.effectivePriceMessage.value.tokenIn
                    : swapping.effectivePriceMessage.value.tokenOut
                }}
              </span>
            </div>
          </div>
        </template>
        <div>
          <BalAlert
            v-if="exceedsBalance"
            class="p-3"
            type="error"
            size="sm"
            :title="`${t('exceedsBalance')} ${fNum2(
              balanceFor(props.swapping.tokenInAddressInput.value),
              FNumFormats.token
            )} ${props.swapping.tokenIn.value.symbol}`"
            block
            square
          />
          <div
            class="relative p-3 border-b border-gray-100 dark:border-gray-900"
          >
            <div class="flex items-center">
              <div class="mr-3">
                <BalAsset
                  :address="swapping.tokenIn.value.address"
                  :size="36"
                />
              </div>
              <div>
                <div class="font-medium">
                  {{
                    fNum2(swapping.tokenInAmountInput.value, FNumFormats.token)
                  }}
                  {{ swapping.tokenIn.value.symbol }}
                </div>
                <div class="text-sm text-secondary">
                  {{ tokenInFiatValue }}
                </div>
              </div>
            </div>
          </div>
          <div class="arrow-down">
            <ArrowDownIcon />
          </div>
          <div class="p-3">
            <div class="flex items-center">
              <div class="mr-3">
                <BalAsset
                  :address="swapping.tokenOut.value.address"
                  :size="36"
                />
              </div>
              <div>
                <div class="font-medium">
                  {{
                    fNum2(swapping.tokenOutAmountInput.value, FNumFormats.token)
                  }}
                  {{ swapping.tokenOut.value.symbol }}
                </div>
                <div class="text-sm text-secondary">
                  {{ tokenOutFiatValue }}
                  <span
                    v-if="
                      swapping.isBalancerSwap.value ||
                      swapping.isWrapUnwrapSwap.value
                    "
                  >
                    / {{ $t('priceImpact') }}:
                    {{
                      fNum2(swapping.sor.priceImpact.value, FNumFormats.percent)
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BalCard>
      <BalCard noPad shadow="none" class="mb-3">
        <template #header>
          <div
            class="flex justify-between items-center p-3 w-full border-b dark:border-gray-900"
          >
            <div class="font-semibold">
              {{ labels.swapSummary.title }}
            </div>
            <div class="flex text-xs uppercase divide-x dark:divide-gray-500">
              <div
                :class="[
                  'pr-2 cursor-pointer font-medium',
                  { 'text-blue-600': !showSummaryInFiat },
                ]"
                @click="showSummaryInFiat = false"
              >
                {{ $t('tokens') }}
              </div>
              <div
                :class="[
                  'pl-2 cursor-pointer font-medium uppercase',
                  { 'text-blue-600': showSummaryInFiat },
                ]"
                @click="showSummaryInFiat = true"
              >
                {{ FiatCurrency.usd }}
              </div>
            </div>
          </div>
        </template>
        <div v-if="swapping.isCowswapSwap.value" class="p-3 text-sm">
          <div class="summary-item-row">
            <div>
              {{ labels.swapSummary.totalBeforeFees }}
            </div>
            <div v-html="summary.amountBeforeFees" />
          </div>
          <div class="summary-item-row">
            <div>{{ $t('swapSummary.gasCosts') }}</div>
            <div class="text-green-400">-{{ zeroFee }}</div>
          </div>
          <div class="summary-item-row">
            <div>{{ labels.swapSummary.swapFees }}</div>
            <div
              v-html="
                swapping.isWrapUnwrapSwap.value
                  ? zeroFee
                  : swapping.exactIn.value
                  ? `-${summary.swapFees}`
                  : `+${summary.swapFees}`
              "
            />
          </div>
        </div>
        <template #footer>
          <div
            class="p-3 w-full text-sm bg-white dark:bg-gray-800 rounded-b-lg"
          >
            <div class="font-medium summary-item-row">
              <div class="w-64">
                {{ labels.swapSummary.totalAfterFees }}
              </div>
              <div v-html="summary.totalWithoutSlippage" />
            </div>
            <div class="summary-item-row text-secondary">
              <div class="w-64">
                {{ labels.swapSummary.totalWithSlippage }}
              </div>
              <div
                v-html="
                  swapping.isWrapUnwrapSwap.value
                    ? ''
                    : summary.totalWithSlippage
                "
              />
            </div>
          </div>
        </template>
      </BalCard>
      <BalAlert
        v-if="showPriceUpdateError"
        class="p-3 mb-4"
        type="error"
        size="md"
        :title="$t('priceUpdatedAlert.title')"
        :description="
          $t('priceUpdatedAlert.description', [
            fNum2(PRICE_UPDATE_THRESHOLD, FNumFormats.percent),
          ])
        "
        :actionLabel="$t('priceUpdatedAlert.actionLabel')"
        block
        @action-click="cofirmPriceUpdate"
      />
      <BalBtn
        v-if="!account"
        color="gradient"
        block
        @click.prevent="startConnectWithInjectedProvider"
      >
        {{ $t('connectWallet') }}
      </BalBtn>
      <BalActionSteps
        v-else
        :actions="actions"
        :isLoading="actionStepsLoading"
        :loadingLabel="actionStepsLoadingLabel"
        :disabled="disableSubmitButton || showPriceUpdateError"
      />
      <BalAlert
        v-if="swapping.submissionError.value != null"
        class="p-3 mt-4"
        type="error"
        size="md"
        :title="$t('swapSubmissionError.title')"
        :description="swapping.submissionError.value"
        block
        :actionLabel="$t('swapSubmissionError.actionLabel')"
        @action-click="swapping.resetSubmissionError"
      />
      <BalAlert
        v-if="swapping.isJoinExitSwap.value"
        class="p-3 mt-4"
        type="tip"
        size="md"
        :title="''"
        :description="
          showBatchRelayerApprovalStep
            ? $t('isJoinExitTipDescription.withApproval')
            : $t('isJoinExitTipDescription.withoutApproval')
        "
        block
      />
    </div>
    <SwapRoute
      v-if="showSwapRoute"
      :addressIn="swapping.tokenIn.value.address"
      :amountIn="swapping.tokenInAmountInput.value"
      :addressOut="swapping.tokenOut.value.address"
      :amountOut="swapping.tokenOutAmountInput.value"
      :pools="pools"
      :sorReturn="swapping.sor.sorReturn.value"
      class="mt-3"
    />
  </BalModal>
</template>

<style scoped>
.arrow-down {
  @apply absolute right-0 rounded-full border border-gray-100 flex items-center h-8 w-8 justify-center bg-white mr-3
    dark:border-gray-800 dark:bg-gray-800;

  transform: translateY(-50%);
}

.summary-item-row {
  @apply flex justify-between mb-1;
}

.step {
  @apply rounded-full w-7 h-7 border border-gray-100 dark:border-gray-700 flex items-center
    justify-center text-purple-500 relative;
}

.step-seperator {
  @apply bg-gray-200 dark:bg-gray-700 h-px w-6;
}

.step-active {
  @apply border-purple-500 dark:border-purple-500;
}

.step-approved {
  @apply border-green-500 dark:border-green-500;
}
</style>
