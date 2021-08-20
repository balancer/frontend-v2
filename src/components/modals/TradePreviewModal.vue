<template>
  <BalModal show @close="onClose" :title="$t('previewTradeTransactions')">
    <div>
      <div
        class="-mx-4 p-4 flex items-center border-b border-t dark:border-gray-800"
      >
        <BalAssetSet
          :addresses="[addressIn, addressOut]"
          :size="32"
          :width="55"
        />
        <div class="flex flex-col">
          <div class="font-bold">
            {{ fNum(amountIn, 'token') }} {{ symbolIn }} ->
            {{ fNum(amountOut, 'token') }} {{ symbolOut }}
          </div>
          <div class="text-gray-500 text-sm">{{ fNum(valueIn, 'usd') }}</div>
        </div>
      </div>
      <div>
        <div class="mt-6 mb-3 text-sm">
          Requires {{ totalRequiredTransactions }}
          {{ requiresApproval ? 'transactions' : 'transaction' }}:
        </div>
        <div>
          <div v-if="requiresLidoRelayerApproval" class="mb-3 card-container">
            <div class="card-step text-green-500">
              <BalIcon
                v-if="isLidoRelayerApproved"
                name="check"
                class="text-green-500"
              />
              <span v-else class="text-gray-500 dark:text-gray-400">1</span>
            </div>
            <div class="ml-3">
              <span v-if="isLidoRelayerApproved">{{
                $t('approvedLidoRelayer')
              }}</span>
              <span v-else>{{ $t('approveLidoRelayer') }}</span>
            </div>
          </div>
          <div v-if="requiresTokenApproval" class="card-container">
            <div class="card-step text-green-500">
              <BalIcon
                v-if="isTokenApproved"
                name="check"
                class="text-green-500"
              />
              <span v-else class="text-gray-500 dark:text-gray-400">{{
                requiresLidoRelayerApproval ? 2 : 1
              }}</span>
            </div>
            <div class="ml-3">
              <span v-if="isTokenApproved"
                >{{ $t('approved') }} {{ symbolIn }}</span
              >
              <span v-else>{{ $t('approve') }} {{ symbolIn }}</span>
            </div>
          </div>
          <div class="mt-3 card-container">
            <div class="card-step text-gray-500 dark:text-gray-400">
              {{ totalRequiredTransactions }}
            </div>
            <div class="ml-3">
              {{ $t('trade') }} {{ fNum(valueIn, 'usd') }} {{ symbolIn }} ->
              {{ symbolOut }}
            </div>
          </div>
        </div>
      </div>
      <BalBtn
        v-if="requiresLidoRelayerApproval && !isLidoRelayerApproved"
        class="mt-5"
        :label="$t('approveLidoRelayer')"
        :loading="approvingLidoRelayer"
        :loading-label="`${$t('approvingLidoRelayer')}…`"
        color="gradient"
        block
        @click.prevent="approveLidoRelayer"
      />
      <BalBtn
        v-else-if="requiresTokenApproval && !isTokenApproved"
        class="mt-5"
        :label="`${$t('approve')} ${symbolIn}`"
        :loading="approvingToken"
        :loading-label="`${$t('approving')} ${symbolIn}…`"
        color="gradient"
        block
        @click.prevent="approveToken"
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
import { defineComponent, toRefs, computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useTokenApproval from '@/composables/trade/useTokenApproval';
import useRelayerApproval, {
  Relayer
} from '@/composables/trade/useRelayerApproval';
import useTokens from '@/composables/useTokens';

import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { getWrapAction, WrapType } from '@/lib/utils/balancer/wrapper';
import { isStETH } from '@/lib/utils/balancer/lido';

export default defineComponent({
  emits: ['trade', 'close'],
  props: {
    open: {
      type: Boolean,
      default: false
    },
    isV1Swap: {
      type: Boolean,
      required: true
    },
    addressIn: {
      type: String,
      required: true
    },
    amountIn: {
      type: String,
      required: true
    },
    addressOut: {
      type: String,
      required: true
    },
    amountOut: {
      type: String,
      required: true
    },
    trading: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const { fNum, toFiat } = useNumbers();

    const { addressIn, amountIn, addressOut, isV1Swap } = toRefs(props);

    const { tokens, approvalRequired } = useTokens();

    const wrapType = computed(() =>
      getWrapAction(addressIn.value, addressOut.value)
    );
    const isWrap = computed(() => wrapType.value === WrapType.Wrap);
    const isUnwrap = computed(() => wrapType.value === WrapType.Unwrap);

    const isStETHTrade = computed(
      () =>
        isStETH(addressIn.value, addressOut.value) &&
        wrapType.value === WrapType.NonWrap
    );

    const tokenApproval = useTokenApproval(addressIn, amountIn, tokens);

    const lidoRelayerApproval = useRelayerApproval(Relayer.LIDO, isStETHTrade);

    const valueIn = computed(() => toFiat(amountIn.value, addressIn.value));

    const symbolIn = computed(() => {
      const token = tokens.value[addressIn.value];
      if (!token) {
        return '';
      }
      return token.symbol;
    });

    const symbolOut = computed(() => {
      const token = tokens.value[addressOut.value];
      if (!token) {
        return '';
      }
      return token.symbol;
    });

    const isEthTrade = computed(() => addressIn.value === NATIVE_ASSET_ADDRESS);

    const requiresTokenApproval = computed(() =>
      isUnwrap.value || isEthTrade.value ? false : true
    );

    const isLidoRelayerApproved = computed(
      () => lidoRelayerApproval.isUnlocked.value
    );
    const requiresLidoRelayerApproval = computed(
      () =>
        isStETHTrade.value &&
        (!isLidoRelayerApproved.value || lidoRelayerApproval.approved.value)
    );

    const requiresApproval = computed(
      () => requiresTokenApproval.value || requiresLidoRelayerApproval.value
    );

    const isTokenApproved = computed(() => {
      if (tokenApproval.approved.value) {
        return true;
      }

      const { isUnlockedV1, isUnlockedV2 } = tokenApproval.allowanceState.value;
      if (isWrap.value && !isEthTrade.value) {
        // If we're wrapping a token other than native ETH
        // we need to approve the underlying on the wrapper
        return !approvalRequired(
          addressIn.value,
          amountIn.value,
          addressOut.value
        );
      }
      return isV1Swap.value ? isUnlockedV1 : isUnlockedV2;
    });

    async function approveLidoRelayer(): Promise<void> {
      await lidoRelayerApproval.approve();
    }

    async function approveToken(): Promise<void> {
      if (isWrap.value && !isEthTrade.value) {
        // If we're wrapping a token other than native ETH
        // we need to approve the underlying on the wrapper
        await tokenApproval.approveSpender(addressOut.value);
      } else if (isV1Swap.value) {
        await tokenApproval.approveV1();
      } else {
        await tokenApproval.approveV2();
      }
    }

    const approvingToken = computed(() => tokenApproval.approving.value);

    const approvingLidoRelayer = computed(
      () => lidoRelayerApproval.approving.value
    );

    const totalRequiredTransactions = computed(() => {
      let txCount = 1; // trade

      if (requiresTokenApproval.value) {
        txCount++;
      }
      if (requiresLidoRelayerApproval.value) {
        txCount++;
      }
      return txCount;
    });

    function trade() {
      emit('trade');
    }

    function onClose() {
      emit('close');
    }

    return {
      // methods
      fNum,
      onClose,
      approveLidoRelayer,
      approveToken,
      trade,
      // computed
      requiresApproval,
      requiresTokenApproval,
      requiresLidoRelayerApproval,
      isTokenApproved,
      isLidoRelayerApproved,
      valueIn,
      symbolIn,
      symbolOut,
      approvingLidoRelayer,
      approvingToken,
      lidoRelayerApproval,
      totalRequiredTransactions
    };
  }
});
</script>
<style scoped>
.card-container {
  @apply p-3 flex items-center border rounded-lg dark:border-gray-800;
}
.card-step {
  @apply w-9 h-9 flex items-center justify-center border rounded-full dark:border-gray-700;
}
</style>
