<template>
  <BalModal show @close="onClose" :title="$t('previewTrade')">
    <div>
      <BalCard noPad class="relative mb-6">
        <template v-slot:header>
          <div class="w-full p-3 border-b bg-gray-100 rounded-t-lg text-sm">
            {{ $t('effectivePrice') }}
            {{
              exactIn
                ? effectivePriceMessage.tokenIn
                : effectivePriceMessage.tokenOut
            }}
          </div>
        </template>
        <div>
          <div class="p-3 border-gray-100 border-b relative">
            <div class="flex items-center">
              <div class="mr-3">
                <BalAsset :address="tokenIn.address" :size="36" />
              </div>
              <div>
                <div class="font-medium">
                  {{ tokenInAmountFormatted }}
                  {{ tokenIn.symbol }}
                </div>
                <div class="text-gray-500 text-sm">
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
                <BalAsset :address="tokenOut.address" :size="36" />
              </div>
              <div>
                <div class="font-medium">
                  {{ tokenOutAmountFormatted }}
                  {{ tokenOut.symbol }}
                </div>
                <div class="text-gray-500 text-sm">
                  {{ tokenOutFiatValue }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </BalCard>
      <BalCard noPad shadow="none" class="mb-6">
        <template v-slot:header>
          <div class="p-3 flex w-full items-center justify-between border-b">
            <div class="font-semibold">{{ $t('summary') }}</div>
            <div class="flex divide-x text-sm">
              <div
                :class="!showSummaryInFiat && 'text-blue-600 font-medium'"
                class="pr-1 cursor-pointer"
                @click="showSummaryInFiat = false"
              >
                {{ $t('tokens') }}
              </div>
              <div
                :class="showSummaryInFiat && 'text-blue-600 font-medium'"
                class="pl-1 cursor-pointer"
                @click="showSummaryInFiat = true"
              >
                {{ FiatCurrency.USD }}
              </div>
            </div>
          </div>
        </template>
        <div class="p-3 text-sm">
          <div class="summary-item-row">
            <div>{{ $t('amountBeforeFees') }}</div>
            <div>
              {{ summary.amountBeforeFees }}
            </div>
          </div>
          <!-- <div class="summary-item-row">
            <div>{{ $t('gasCosts') }}</div>
            <div class="text-green-400">
              0.00
            </div>
          </div> -->
          <div class="summary-item-row">
            <div>{{ $t('solverFees') }}</div>
            <div>
              {{ summary.solverFees }}
            </div>
          </div>
        </div>
        <template v-slot:footer v-if="tradeRoute === 'gnosis'">
          <div class="w-full p-3 rounded-b-lg bg-white text-sm">
            <div class="summary-item-row font-medium">
              <div>
                {{
                  exactIn
                    ? $t('expectedReceiveNoSlippage')
                    : $t('expectedSellNoSlippage')
                }}
              </div>
              <div>
                {{ summary.totalWithoutSlippage }}
              </div>
            </div>
            <div class="summary-item-row">
              <div>
                {{
                  exactIn
                    ? $t('minReceivedWithSlippage', [slippageRatePercent])
                    : $t('maxSoldWithSlippage', [slippageRatePercent])
                }}
              </div>
              <div>
                {{ summary.totalWithSlippage }}
              </div>
            </div>
          </div>
        </template>
      </BalCard>
      <BalCard shadow="none">
        <div class="font-semibold mb-2">
          Requires {{ requiresApproval ? 2 : 1 }}
          {{ requiresApproval ? 'transactions' : 'transaction' }}:
        </div>
        <div class="text-sm">
          <div v-if="requiresApproval" class="flex items-center mb-2">
            <div class="tx-circle text-green-500">
              <BalIcon
                v-if="isApproved"
                name="check"
                size="sm"
                class="text-green-500"
              />
              <span v-else class="text-gray-500">1</span>
            </div>
            <div class="ml-3">
              <span v-if="isApproved">{{ $t('approved') }}</span>
              <span v-else>{{ $t('approve') }}</span>
            </div>
          </div>
          <div class="flex items-center">
            <div class="tx-circle text-gray-500">
              {{ requiresApproval ? 2 : 1 }}
            </div>
            <div class="ml-3">
              {{ $t('trade') }} {{ tokenInFiatValue }} {{ tokenIn.symbol }} ->
              {{ tokenOut.symbol }}
            </div>
          </div>
        </div>
      </BalCard>
      <BalBtn
        v-if="requiresApproval && !isApproved"
        class="mt-5"
        :label="`${$t('approve')} ${tokenIn.symbol}`"
        :loading="approving"
        :loading-label="`${$t('approving')} ${tokenIn.symbol}…`"
        color="gradient"
        block
        @click.prevent="approve"
      />
      <BalBtn
        v-else
        class="mt-5"
        :label="$t('confirmTrade')"
        :loading="trading"
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="trade"
      />
    </div>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed, PropType, ref } from 'vue';

import useNumbers from '@/composables/useNumbers';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';
import { Token } from '@/types';
import { formatUnits } from '@ethersproject/units';
import { bnum } from '@/lib/utils';
import { useStore } from 'vuex';

import { FiatCurrency } from '@/constants/currency';

export default defineComponent({
  emits: ['trade', 'close'],
  props: {
    exactIn: {
      type: Boolean,
      required: true
    },
    trading: {
      type: Boolean,
      required: true
    },
    tokenIn: {
      type: Object as PropType<Token>,
      required: true
    },
    tokenOut: {
      type: Object as PropType<Token>,
      required: true
    },
    tokenInAmount: {
      type: String,
      required: true
    },
    tokenOutAmount: {
      type: String,
      required: true
    },
    effectivePriceMessage: {
      type: Object,
      required: true
    },
    feeAmountInTokenScaled: {
      type: String,
      required: true
    },
    feeAmountOutTokenScaled: {
      type: String,
      required: true
    },
    minimumOutAmountScaled: {
      type: String,
      required: true
    },
    maximumInAmountScaled: {
      type: String,
      required: true
    },
    requiresApproval: {
      type: Boolean,
      required: true
    },
    tradeRoute: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    // COMPOSABLES
    const store = useStore();
    const { fNum, toFiat } = useNumbers();

    // DATA
    const {
      minimumOutAmountScaled,
      maximumInAmountScaled,
      feeAmountOutTokenScaled,
      feeAmountInTokenScaled,
      exactIn,
      tokenIn,
      tokenInAmount,
      tokenOut,
      tokenOutAmount
    } = toRefs(props);
    const showSummaryInFiat = ref(false);

    // COMPUTED
    const slippageRatePercent = computed(() =>
      fNum(store.state.app.slippage, 'percent')
    );

    const addressIn = computed(() => tokenIn.value.address);

    const tokenInFiatValue = computed(() =>
      fNum(toFiat(tokenInAmount.value, tokenIn.value.address), 'usd')
    );

    const tokenOutFiatValue = computed(() =>
      fNum(toFiat(tokenOutAmount.value, tokenOut.value.address), 'usd')
    );

    const tokenInAmountFormatted = computed(() =>
      fNum(tokenInAmount.value, 'token')
    );

    const tokenOutAmountFormatted = computed(() =>
      fNum(tokenOutAmount.value, 'token')
    );

    const summary = computed(() => {
      let amountBeforeFees = '';
      let solverFees = '';
      let totalWithoutSlippage = '';
      let totalWithSlippage = '';

      if (exactIn.value) {
        amountBeforeFees = tokenOutAmount.value;
        solverFees = formatUnits(
          feeAmountOutTokenScaled.value,
          tokenOut.value.decimals
        );
        totalWithoutSlippage = bnum(amountBeforeFees)
          .minus(solverFees)
          .toString();
        totalWithSlippage = formatUnits(
          minimumOutAmountScaled.value,
          tokenOut.value.decimals
        );

        if (showSummaryInFiat.value) {
          amountBeforeFees = fNum(
            toFiat(amountBeforeFees, tokenOut.value.address),
            'usd'
          );
          solverFees = fNum(toFiat(solverFees, tokenOut.value.address), 'usd');
          totalWithoutSlippage = fNum(
            toFiat(totalWithoutSlippage, tokenOut.value.address),
            'usd'
          );
          totalWithSlippage = fNum(
            toFiat(totalWithSlippage, tokenOut.value.address),
            'usd'
          );
        } else {
          amountBeforeFees = `${fNum(amountBeforeFees, 'token')} ${
            tokenOut.value.symbol
          }`;
          solverFees = `${fNum(solverFees, 'token')} ${tokenOut.value.symbol}`;
          totalWithoutSlippage = `${fNum(totalWithoutSlippage, 'token')} ${
            tokenOut.value.symbol
          }`;
          totalWithSlippage = `${fNum(totalWithSlippage, 'token')} ${
            tokenOut.value.symbol
          }`;
        }
      } else {
        amountBeforeFees = tokenInAmount.value;
        solverFees = formatUnits(
          feeAmountInTokenScaled.value,
          tokenIn.value.decimals
        );
        totalWithoutSlippage = bnum(amountBeforeFees)
          .plus(solverFees)
          .toString();
        totalWithSlippage = formatUnits(
          maximumInAmountScaled.value,
          tokenIn.value.decimals
        );

        if (showSummaryInFiat.value) {
          amountBeforeFees = fNum(
            toFiat(amountBeforeFees, tokenIn.value.address),
            'usd'
          );
          solverFees = fNum(toFiat(solverFees, tokenIn.value.address), 'usd');
          totalWithoutSlippage = fNum(
            toFiat(totalWithoutSlippage, tokenIn.value.address),
            'usd'
          );
          totalWithSlippage = fNum(
            toFiat(totalWithSlippage, tokenIn.value.address),
            'usd'
          );
        } else {
          amountBeforeFees = `${fNum(amountBeforeFees, 'token')} ${
            tokenIn.value.symbol
          }`;
          solverFees = `${fNum(solverFees, 'token')} ${tokenIn.value.symbol}`;
          totalWithoutSlippage = `${fNum(totalWithoutSlippage, 'token')} ${
            tokenIn.value.symbol
          }`;
          totalWithSlippage = `${fNum(totalWithSlippage, 'token')} ${
            tokenIn.value.symbol
          }`;
        }
      }

      return {
        amountBeforeFees,
        solverFees,
        totalWithoutSlippage,
        totalWithSlippage
      };
    });

    const { approving, isApproved, approve } = useTokenApprovalGP(
      addressIn,
      tokenInAmount
    );

    // METHODS
    function trade() {
      emit('trade');
    }

    function onClose() {
      emit('close');
    }

    return {
      // constants
      FiatCurrency,

      // methods
      fNum,
      onClose,
      approve,
      trade,

      // computed
      isApproved,
      approving,
      tokenInFiatValue,
      tokenOutFiatValue,
      tokenInAmountFormatted,
      tokenOutAmountFormatted,
      summary,
      showSummaryInFiat,
      slippageRatePercent
    };
  }
});
</script>
<style scoped>
.arrow-down {
  @apply absolute right-0 rounded-full border border-gray-100 flex items-center h-8 w-8 justify-center bg-white mr-3;
  transform: translateY(-50%);
}

.summary-item-row {
  @apply flex justify-between mb-1;
}

.tx-circle {
  @apply w-6 h-6 flex items-center justify-center border rounded-full;
}
</style>
