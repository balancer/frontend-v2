<template>
  <BalModal show @close="onClose" :title="$t('previewTrade')">
    <div>
      <BalCard noPad class="relative mb-6 overflow-auto">
        <template v-slot:header>
          <div
            class="w-full p-3 border-b bg-gray-50 rounded-t-lg text-sm dark:border-gray-800 dark:bg-gray-800"
          >
            <span>
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
          <div
            class="p-3 border-gray-100 border-b relative dark:border-gray-900"
          >
            <div class="flex items-center">
              <div class="mr-3">
                <BalAsset :address="trading.tokenIn.value.address" :size="36" />
              </div>
              <div>
                <div class="font-medium">
                  {{ fNum(trading.tokenInAmountInput.value, 'token') }}
                  {{ trading.tokenIn.value.symbol }}
                </div>
                <div class="text-gray-500 dark:text-gray-400 text-sm">
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
                <div class="text-gray-500 dark:text-gray-400 text-sm">
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
          <div
            class="p-3 flex w-full items-center justify-between border-b dark:border-gray-900"
          >
            <div class="font-semibold">
              {{
                trading.exactIn.value
                  ? $t('tradeSummary.exactIn.title', [
                      trading.tokenIn.value.symbol
                    ])
                  : $t('tradeSummary.exactOut.title', [
                      trading.tokenOut.value.symbol
                    ])
              }}
            </div>
            <div class="flex divide-x dark:divide-gray-500 text-xs uppercase">
              <div
                :class="[
                  'pr-2 cursor-pointer font-medium',
                  { 'text-blue-600': !showSummaryInFiat }
                ]"
                @click="showSummaryInFiat = false"
              >
                {{ $t('tokens') }}
              </div>
              <div
                :class="[
                  'pl-2 cursor-pointer font-medium',
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
            <div>
              {{
                trading.exactIn.value
                  ? $t('tradeSummary.exactIn.totalBeforeFees')
                  : $t('tradeSummary.exactOut.totalBeforeFees')
              }}
            </div>
            <div>
              {{ summary.amountBeforeFees }}
            </div>
          </div>
          <div class="summary-item-row" v-if="trading.isGnosisTrade.value">
            <div>{{ $t('tradeSummary.gasCosts') }}</div>
            <div class="text-green-400">
              -{{ showSummaryInFiat ? fNum('0', 'usd') : '0.0 ETH' }}
            </div>
          </div>
          <div class="summary-item-row">
            <div>{{ $t('tradeSummary.tradeFees') }}</div>
            <div>
              {{
                trading.isGnosisTrade.value
                  ? trading.exactIn.value
                    ? `-${summary.tradeFees}`
                    : `+${summary.tradeFees}`
                  : summary.tradeFees
              }}
            </div>
          </div>
        </div>
        <template v-slot:footer>
          <div
            class="w-full p-3 rounded-b-lg bg-white text-sm dark:bg-gray-800"
          >
            <div class="summary-item-row font-medium">
              <div class="w-64">
                {{
                  trading.exactIn.value
                    ? $t('tradeSummary.exactIn.totalAfterFees')
                    : $t('tradeSummary.exactOut.totalAfterFees')
                }}
              </div>
              <div>
                {{ summary.totalWithoutSlippage }}
              </div>
            </div>
            <div class="summary-item-row text-gray-500 dark:text-gray-400">
              <div class="w-64">
                {{
                  trading.exactIn.value
                    ? $t('tradeSummary.exactIn.totalWithSlippage', [
                        slippageRatePercent
                      ])
                    : $t('tradeSummary.exactOut.totalWithSlippage', [
                        `${fNum(trading.tokenOutAmountInput.value, 'token')} ${
                          trading.tokenOut.value.symbol
                        }`,
                        slippageRatePercent
                      ])
                }}
              </div>
              <div>
                {{ summary.totalWithSlippage }}
              </div>
            </div>
          </div>
        </template>
      </BalCard>
      <div v-if="trading.requiresApproval.value" class="flex justify-between">
        <BalBtn
          v-if="!isUnlocked || approved"
          :loading="approving"
          :loading-label="`${$t('approving')}...`"
          color="gradient"
          block
          :disabled="isUnlocked"
          @click.prevent="approve"
          class="mr-5"
        >
          <div :class="['button-step', { 'button-step-disabled': isUnlocked }]">
            <template v-if="isUnlocked">
              <BalIcon
                name="check"
                size="sm"
                class="text-gray-300 dark:text-gray-700 mt-0.5"
              />
            </template>
            <template v-else>1</template>
          </div>
          {{ `${$t('approve')} ${trading.tokenIn.value.symbol}` }}
        </BalBtn>
        <BalBtn
          color="gradient"
          block
          @click.prevent="trade"
          :loading="trading.isTrading.value"
          :loading-label="$t('confirming')"
          :disabled="!isUnlocked"
        >
          <div
            v-if="!isUnlocked || approved"
            :class="['button-step', { 'button-step-disabled': !isUnlocked }]"
          >
            2
          </div>
          {{ $t('confirmTrade') }}
        </BalBtn>
      </div>
      <BalBtn
        v-else
        color="gradient"
        block
        @click.prevent="trade"
        :loading="trading.isTrading.value"
        :loading-label="$t('confirming')"
      >
        {{ $t('confirmTrade') }}
      </BalBtn>
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

    const showSummary = computed(() => !props.trading.isWrapOrUnwrap.value);

    const showTradeRoute = computed(
      () =>
        props.trading.isBalancerTrade.value &&
        !props.trading.isWrapOrUnwrap.value
    );

    const summaryItems = computed(() => {
      if (!showSummary.value) {
        return;
      }

      const summaryItems = {
        amountBeforeFees: '',
        tradeFees: '',
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
        summaryItems.tradeFees = formatUnits(
          quote.feeAmountOutToken,
          tokenOut.decimals
        );
        summaryItems.totalWithoutSlippage = bnum(summaryItems.amountBeforeFees)
          .minus(summaryItems.tradeFees)
          .toString();
        summaryItems.totalWithSlippage = formatUnits(
          quote.minimumOutAmount,
          tokenOut.decimals
        );
      } else {
        summaryItems.amountBeforeFees = tokenInAmountInput;
        summaryItems.tradeFees = formatUnits(
          quote.feeAmountInToken,
          tokenIn.decimals
        );
        summaryItems.totalWithoutSlippage = bnum(summaryItems.amountBeforeFees)
          .plus(summaryItems.tradeFees)
          .toString();
        summaryItems.totalWithSlippage = formatUnits(
          quote.maximumInAmount,
          tokenIn.decimals
        );
      }

      return summaryItems;
    });

    const summary = computed(() => {
      if (!showSummary.value) {
        return;
      }

      const exactIn = props.trading.exactIn.value;

      const tokenIn = props.trading.tokenIn.value;
      const tokenOut = props.trading.tokenOut.value;

      if (showSummaryInFiat.value) {
        return mapValues(summaryItems.value, itemValue =>
          fNum(
            toFiat(itemValue, exactIn ? tokenOut.address : tokenIn.address),
            'usd'
          )
        );
      } else {
        return mapValues(
          summaryItems.value,
          itemValue =>
            `${fNum(itemValue, 'token')} ${
              exactIn ? tokenOut.symbol : tokenIn.symbol
            }`
        );
      }
    });

    const tradeFiatValue = computed(() => {
      if (showSummary.value && !props.trading.exactIn.value) {
        return fNum(
          toFiat(
            summaryItems.value?.totalWithoutSlippage ?? 0,
            props.trading.exactIn.value
              ? props.trading.tokenOut.value.address
              : props.trading.tokenIn.value.address
          ),
          'usd'
        );
      }

      return tokenInFiatValue.value;
    });

    const { approving, isUnlocked, approve, approved } = useTokenApprovalGP(
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
      isUnlocked,
      approving,
      approved,
      tokenInFiatValue,
      tokenOutFiatValue,
      summary,
      showSummaryInFiat,
      slippageRatePercent,
      showSummary,
      showTradeRoute,
      tradeFiatValue
    };
  }
});
</script>
<style scoped>
.arrow-down {
  @apply absolute right-0 rounded-full border border-gray-100 flex items-center h-8 w-8 justify-center bg-white mr-3 dark:border-gray-800 dark:bg-gray-800;
  transform: translateY(-50%);
}

.summary-item-row {
  @apply flex justify-between mb-1;
}

.tx-circle {
  @apply w-6 h-6 flex items-center justify-center border rounded-full;
}
.button-step {
  @apply rounded-full w-6 h-6 bg-white  mr-2 flex items-center justify-center text-purple-500 overflow-hidden overflow-ellipsis;
}
.button-step-disabled {
  @apply text-gray-300 dark:text-gray-700;
}
</style>
