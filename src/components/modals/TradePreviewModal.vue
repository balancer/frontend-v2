<template>
  <BalModal show :title="$t('previewTradeTransactions')" @close="onClose">
    <div>
      <div
        class="flex items-center p-4 -mx-4 border-t border-b dark:border-gray-800"
      >
        <BalAssetSet
          :addresses="[addressIn, addressOut]"
          :size="32"
          :width="55"
        />
        <div class="flex flex-col">
          <div class="font-semibold">
            {{ fNum2(amountIn, FNumFormats.token) }}
            {{ symbolIn }} -> {{ fNum2(amountOut, FNumFormats.token) }}
            {{ symbolOut }}
          </div>
          <div class="text-sm text-secondary">
            {{ fNum2(valueIn, FNumFormats.fiat) }}
          </div>
        </div>
      </div>
      <div>
        <div class="mt-6 mb-3 text-sm">
          Requires {{ totalRequiredTransactions }}
          {{ requiresApproval ? 'transactions' : 'transaction' }}:
        </div>
        <div>
          <div v-if="requiresLidoRelayerApproval" class="mb-3 card-container">
            <div class="text-green-500 card-step">
              <BalIcon
                v-if="isLidoRelayerApproved"
                name="check"
                class="text-green-500"
              />
              <span v-else class="text-secondary">1</span>
            </div>
            <div class="ml-3">
              <span v-if="isLidoRelayerApproved">{{
                $t('approvedLidoRelayer')
              }}</span>
              <span v-else>{{ $t('approveLidoRelayer') }}</span>
            </div>
          </div>
          <div v-if="requiresTokenApproval" class="card-container">
            <div class="text-green-500 card-step">
              <BalIcon
                v-if="isTokenApproved"
                name="check"
                class="text-green-500"
              />
              <span v-else class="text-secondary">{{
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
            <div class="card-step text-secondary">
              {{ totalRequiredTransactions }}
            </div>
            <div class="ml-3">
              {{ $t('trade') }} {{ fNum2(valueIn, FNumFormats.fiat) }}
              {{ symbolIn }} ->
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
        :loadingLabel="`${$t('approvingLidoRelayer')}…`"
        color="gradient"
        block
        @click.prevent="approveLidoRelayer"
      />
      <BalBtn
        v-else-if="requiresTokenApproval && !isTokenApproved"
        class="mt-5"
        :label="`${$t('approve')} ${symbolIn}`"
        :loading="approvingToken"
        :loadingLabel="`${$t('approving')} ${symbolIn}…`"
        color="gradient"
        block
        @click.prevent="approveToken"
      />
      <BalBtn
        v-else
        class="mt-5"
        :label="$t('confirmTrade')"
        :loading="trading"
        :loadingLabel="$t('confirming')"
        color="gradient"
        block
        @click.prevent="trade"
      />
    </div>
  </BalModal>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue';

import useRelayerApproval, {
  Relayer,
} from '@/composables/trade/useRelayerApproval';
import useTokenApproval from '@/composables/trade/useTokenApproval';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { isStETH } from '@/lib/utils/balancer/lido';
import { getWrapAction, WrapType } from '@/lib/utils/balancer/wrapper';

export default defineComponent({
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    addressIn: {
      type: String,
      required: true,
    },
    amountIn: {
      type: String,
      required: true,
    },
    addressOut: {
      type: String,
      required: true,
    },
    amountOut: {
      type: String,
      required: true,
    },
    trading: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['trade', 'close'],
  setup(props, { emit }) {
    const { fNum2, toFiat } = useNumbers();

    const { addressIn, amountIn, addressOut } = toRefs(props);

    const { tokens, getToken, approvalRequired } = useTokens();

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
      const token = getToken(addressIn.value);
      if (!token) {
        return '';
      }
      return token.symbol;
    });

    const symbolOut = computed(() => {
      const token = getToken(addressOut.value);
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

      const { isUnlockedV2 } = tokenApproval.allowanceState.value;
      if (isWrap.value && !isEthTrade.value) {
        // If we're wrapping a token other than native ETH
        // we need to approve the underlying on the wrapper
        return !approvalRequired(
          addressIn.value,
          amountIn.value,
          addressOut.value
        );
      }
      return isUnlockedV2;
    });

    async function approveLidoRelayer(): Promise<void> {
      await lidoRelayerApproval.approve();
    }

    async function approveToken(): Promise<void> {
      if (isWrap.value && !isEthTrade.value) {
        // If we're wrapping a token other than native ETH
        // we need to approve the underlying on the wrapper
        await tokenApproval.approveSpender(addressOut.value);
      } else {
        await tokenApproval.approveV2();
      }
    }

    const approvingToken = computed(() => tokenApproval.approving.value);

    const approvingLidoRelayer = computed(
      () =>
        lidoRelayerApproval.init.value || lidoRelayerApproval.approving.value
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
      // constants
      FNumFormats,
      // methods
      fNum2,
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
      totalRequiredTransactions,
    };
  },
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
