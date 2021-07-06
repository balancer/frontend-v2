<template>
  <BalModal show @close="onClose" :title="$t('previewTrade')">
    <div>
      <BalCard noPad class="relative mb-6 overflow-hidden">
        <template v-slot:header>
          <div class="w-full p-3 border-b bg-gray-50 rounded-t-lg text-xs">
            <span class="text-gray-500">
              {{ $t('effectivePrice') }}
            </span>
            {{
              trading.exactIn.value
                ? trading.effectivePriceMessage.value.tokenIn
                : trading.effectivePriceMessage.value.tokenOut
            }}
          </div>
        </template>
        <div>
          <div class="p-3 border-gray-100 border-b relative">
            <div class="flex items-center">
              <div class="mr-3">
                <BalAsset :address="trading.tokenIn.value.address" :size="36" />
              </div>
              <div>
                <div class="font-medium">
                  {{ fNum(trading.tokenInAmountInput.value, 'token') }}
                  {{ trading.tokenIn.value.symbol }}
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
                <BalAsset
                  :address="trading.tokenOut.value.address"
                  :size="36"
                />
              </div>
              <div>
                <div class="font-medium">
                  {{ fNum(trading.tokenOutAmountInput.value, 'token') }}
                  {{ trading.tokenOut.value.symbol }}
                </div>
                <div class="text-gray-500 text-sm">
                  {{ tokenOutFiatValue }}
                  <span v-if="trading.isBalancerTrade.value">
                    / {{ $t('priceImpact') }}:
                    {{ fNum(trading.sor.priceImpact.value, 'percent') }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </BalCard>
      <BalCard shadow="none" class="my-5" v-if="showTradeRoute">
        <TradeRoute
          :address-in="trading.tokenIn.value.address"
          :amount-in="trading.tokenInAmountInput.value"
          :address-out="trading.tokenOut.value.address"
          :amount-out="trading.tokenOutAmountInput.value"
          :pools="trading.sor.pools.value"
          :sor-return="trading.sor.sorReturn.value"
        />
      </BalCard>
      <BalCard noPad shadow="none" class="mb-6" v-if="showSummary">
        <template v-slot:header>
          <div class="p-3 flex w-full items-center justify-between border-b">
            <div class="font-semibold">{{ $t('summary') }}</div>
            <div class="flex divide-x text-xs uppercase">
              <div
                :class="[
                  'pr-1 cursor-pointer font-medium',
                  { 'text-blue-600': !showSummaryInFiat }
                ]"
                @click="showSummaryInFiat = false"
              >
                {{ $t('tokens') }}
              </div>
              <div
                :class="[
                  'pl-1 cursor-pointer font-medium',
                  { 'text-blue-600': showSummaryInFiat }
                ]"
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
          <div class="summary-item-row">
            <div>{{ $t('gasCosts') }}</div>
            <div v-if="trading.isGnosisTrade.value" class="text-green-400">
              {{ fNum('0', showSummaryInFiat ? 'usd' : 'token') }}
            </div>
            <div v-else>
              <!-- TODO: in order to calculate this I need to get gasLimit of the transaction + gwei price -->
              Calculated on confirmation
            </div>
          </div>
          <div class="summary-item-row">
            <div>{{ $t('solverFees') }}</div>
            <div>
              {{ summary.solverFees }}
            </div>
          </div>
        </div>
        <template v-slot:footer>
          <div class="w-full p-3 rounded-b-lg bg-white text-sm">
            <div class="summary-item-row font-medium">
              <div>
                {{
                  trading.exactIn.value
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
                  trading.exactIn.value
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
      <BalCard noPad shadow="none">
        <template v-slot:header>
          <div class="p-3 flex w-full items-center justify-between border-b">
            <div class="font-semibold">
              {{
                $tc('requiresTransactions', approvalTxCount, {
                  txCount: approvalTxCount
                })
              }}
            </div>
          </div>
        </template>
        <div class="p-3 text-sm">
          <div
            v-if="trading.requiresApproval.value"
            class="flex items-center mb-2"
          >
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
              {{ trading.requiresApproval.value ? 2 : 1 }}
            </div>
            <div class="ml-3">
              {{ $t('trade') }} {{ tokenInFiatValue }}
              {{ trading.tokenIn.value.symbol }} ->
              {{ trading.tokenOut.value.symbol }}
            </div>
          </div>
        </div>
      </BalCard>
      <BalBtn
        v-if="trading.requiresApproval.value && !isApproved"
        class="mt-5"
        :label="`${$t('approve')} ${trading.tokenIn.value.symbol}`"
        :loading="approving"
        :loading-label="`${$t('approving')} ${trading.tokenIn.value.symbol}…`"
        color="gradient"
        block
        @click.prevent="approve"
      />
      <BalBtn
        v-else
        class="mt-5"
        :label="$t('confirmTrade')"
        color="gradient"
        block
        @click.prevent="trade"
      />
    </div>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue';
import { useStore } from 'vuex';
import { formatUnits } from '@ethersproject/units';

import { UseTrading } from '@/composables/trade/useTrading';
import useNumbers from '@/composables/useNumbers';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';

import TradeRoute from '@/components/cards/TradeCard/TradeRoute.vue';

import { bnum } from '@/lib/utils';

import { FiatCurrency } from '@/constants/currency';
import { mapValues } from 'lodash';

export default defineComponent({
  components: {
    TradeRoute
  },
  emits: ['trade', 'close'],
  props: {
    trading: {
      type: Object as PropType<UseTrading>,
      required: true
    }
  },
  setup(props, { emit }) {
    // COMPOSABLES
    const store = useStore();
    const { fNum, toFiat } = useNumbers();

    // DATA
    const showSummaryInFiat = ref(false);

    // COMPUTED
    const slippageRatePercent = computed(() =>
      fNum(store.state.app.slippage, 'percent')
    );

    const addressIn = computed(() => props.trading.tokenIn.value.address);

    const tokenInFiatValue = computed(() =>
      fNum(
        toFiat(
          props.trading.tokenInAmountInput.value,
          props.trading.tokenIn.value.address
        ),
        'usd'
      )
    );

    const tokenOutFiatValue = computed(() =>
      fNum(
        toFiat(
          props.trading.tokenOutAmountInput.value,
          props.trading.tokenOut.value.address
        ),
        'usd'
      )
    );

    const approvalTxCount = computed(() =>
      props.trading.requiresApproval.value ? 2 : 1
    );

    const showSummary = computed(() => !props.trading.isWrapOrUnwrap.value);

    const showTradeRoute = computed(
      () =>
        props.trading.isBalancerTrade.value &&
        !props.trading.isWrapOrUnwrap.value
    );

    const summary = computed(() => {
      if (!showSummary.value) {
        return;
      }

      const summaryItems = {
        amountBeforeFees: '',
        solverFees: '',
        totalWithoutSlippage: '',
        totalWithSlippage: ''
      };

      const exactIn = props.trading.exactIn.value;

      const tokenIn = props.trading.tokenIn.value;
      const tokenOut = props.trading.tokenOut.value;

      const tokenInAmountInput = props.trading.tokenInAmountInput.value;
      const tokenOutAmountInput = props.trading.tokenOutAmountInput.value;

      const quote = props.trading.getQuote();

      if (exactIn) {
        summaryItems.amountBeforeFees = tokenOutAmountInput;
        summaryItems.solverFees = formatUnits(
          quote.feeAmountOutToken,
          tokenOut.decimals
        );
        summaryItems.totalWithoutSlippage = bnum(summaryItems.amountBeforeFees)
          .minus(summaryItems.solverFees)
          .toString();
        summaryItems.totalWithSlippage = formatUnits(
          quote.minimumOutAmount,
          tokenOut.decimals
        );
      } else {
        summaryItems.amountBeforeFees = tokenInAmountInput;
        summaryItems.solverFees = formatUnits(
          quote.feeAmountInToken,
          tokenIn.decimals
        );
        summaryItems.totalWithoutSlippage = bnum(summaryItems.amountBeforeFees)
          .plus(summaryItems.solverFees)
          .toString();
        summaryItems.totalWithSlippage = formatUnits(
          quote.maximumInAmount,
          tokenIn.decimals
        );
      }

      if (showSummaryInFiat.value) {
        return mapValues(summaryItems, itemValue =>
          fNum(
            toFiat(itemValue, exactIn ? tokenOut.address : tokenIn.address),
            'usd'
          )
        );
      } else {
        return mapValues(
          summaryItems,
          itemValue =>
            `${fNum(itemValue, 'token')} ${
              exactIn ? tokenOut.symbol : tokenIn.symbol
            }`
        );
      }
    });

    const { approving, isApproved, approve } = useTokenApprovalGP(
      addressIn,
      props.trading.tokenInAmountInput
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
      summary,
      showSummaryInFiat,
      slippageRatePercent,
      showSummary,
      showTradeRoute,
      approvalTxCount
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
