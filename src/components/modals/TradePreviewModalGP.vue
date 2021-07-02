<template>
  <BalModal show @close="onClose" :title="$t('previewTrade')">
    <div>
      <BalCard noPad class="relative mb-6">
        <template v-slot:header>
          <div class="w-full p-3 border-b bg-gray-100 rounded-t-lg text-sm">
            {{ $t('effectivePrice') }}
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
      <BalCard
        shadow="none"
        class="my-5"
        v-if="
          trading.isBalancerTrade.value &&
            !trading.isWrap.value &&
            !trading.isUnwrap.value
        "
      >
        <TradeRoute
          :address-in="trading.tokenIn.value.address"
          :amount-in="trading.tokenInAmountInput.value"
          :address-out="trading.tokenOut.value.address"
          :amount-out="trading.tokenOutAmountInput.value"
          :pools="trading.sor.pools.value"
          :sor-return="trading.sor.sorReturn.value"
        />
      </BalCard>
      <BalCard
        noPad
        shadow="none"
        class="mb-6"
        v-if="trading.isGnosisTrade.value"
      >
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
          <div class="summary-item-row">
            <div>{{ $t('gasCosts') }}</div>
            <div class="text-green-400">
              0.00
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
      <BalCard shadow="none">
        <div class="font-semibold mb-2">
          Requires {{ trading.requiresApproval.value ? 2 : 1 }}
          {{ trading.requiresApproval.value ? 'transactions' : 'transaction' }}:
        </div>
        <div class="text-sm">
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

    const summary = computed(() => {
      let amountBeforeFees = '';
      let solverFees = '';
      let totalWithoutSlippage = '';
      let totalWithSlippage = '';

      if (props.trading.isGnosisTrade.value) {
        if (props.trading.exactIn.value) {
          amountBeforeFees = props.trading.tokenOutAmountInput.value;
          solverFees = formatUnits(
            props.trading.gnosis.feeAmountOutTokenScaled.value,
            props.trading.tokenOut.value.decimals
          );
          totalWithoutSlippage = bnum(amountBeforeFees)
            .minus(solverFees)
            .toString();
          totalWithSlippage = formatUnits(
            props.trading.gnosis.minimumOutAmountScaled.value,
            props.trading.tokenOut.value.decimals
          );

          if (showSummaryInFiat.value) {
            amountBeforeFees = fNum(
              toFiat(amountBeforeFees, props.trading.tokenOut.value.address),
              'usd'
            );
            solverFees = fNum(
              toFiat(solverFees, props.trading.tokenOut.value.address),
              'usd'
            );
            totalWithoutSlippage = fNum(
              toFiat(
                totalWithoutSlippage,
                props.trading.tokenOut.value.address
              ),
              'usd'
            );
            totalWithSlippage = fNum(
              toFiat(totalWithSlippage, props.trading.tokenOut.value.address),
              'usd'
            );
          } else {
            amountBeforeFees = `${fNum(amountBeforeFees, 'token')} ${
              props.trading.tokenOut.value.symbol
            }`;
            solverFees = `${fNum(solverFees, 'token')} ${
              props.trading.tokenOut.value.symbol
            }`;
            totalWithoutSlippage = `${fNum(totalWithoutSlippage, 'token')} ${
              props.trading.tokenOut.value.symbol
            }`;
            totalWithSlippage = `${fNum(totalWithSlippage, 'token')} ${
              props.trading.tokenOut.value.symbol
            }`;
          }
        } else {
          amountBeforeFees = props.trading.tokenInAmountInput.value;
          solverFees = formatUnits(
            props.trading.gnosis.feeAmountInTokenScaled.value,
            props.trading.tokenIn.value.decimals
          );
          totalWithoutSlippage = bnum(amountBeforeFees)
            .plus(solverFees)
            .toString();
          totalWithSlippage = formatUnits(
            props.trading.gnosis.maximumInAmountScaled.value,
            props.trading.tokenIn.value.decimals
          );

          if (showSummaryInFiat.value) {
            amountBeforeFees = fNum(
              toFiat(amountBeforeFees, props.trading.tokenIn.value.address),
              'usd'
            );
            solverFees = fNum(
              toFiat(solverFees, props.trading.tokenIn.value.address),
              'usd'
            );
            totalWithoutSlippage = fNum(
              toFiat(totalWithoutSlippage, props.trading.tokenIn.value.address),
              'usd'
            );
            totalWithSlippage = fNum(
              toFiat(totalWithSlippage, props.trading.tokenIn.value.address),
              'usd'
            );
          } else {
            amountBeforeFees = `${fNum(amountBeforeFees, 'token')} ${
              props.trading.tokenIn.value.symbol
            }`;
            solverFees = `${fNum(solverFees, 'token')} ${
              props.trading.tokenIn.value.symbol
            }`;
            totalWithoutSlippage = `${fNum(totalWithoutSlippage, 'token')} ${
              props.trading.tokenIn.value.symbol
            }`;
            totalWithSlippage = `${fNum(totalWithSlippage, 'token')} ${
              props.trading.tokenIn.value.symbol
            }`;
          }
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
