<template>
  <BalModal
    :show="open"
    @close="onClose"
    :title="$t('previewTradeTransactions')"
  >
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
          Requires {{ approvalTxCount }}
          {{ requiresApproval ? 'transactions' : 'transaction' }}:
        </div>
        <div>
          <div v-if="requiresBatchRelayerApproval" class="mb-3 card-container">
            <div class="card-content text-green-500">
              <BalIcon
                v-if="isBatchRelayerApproved"
                name="check"
                class="text-green-500"
              />
              <span v-else class="text-gray-500 dark:text-gray-400">1</span>
            </div>
            <div class="ml-3">
              <span v-if="isBatchRelayerApproved">{{ $t('approved') }}</span>
              <span v-else>{{ $t('approveBatchRelayer') }}</span>
            </div>
          </div>
          <div v-if="requiresTokenApproval" class="card-container">
            <div class="card-content text-green-500">
              <BalIcon
                v-if="isTokenApproved"
                name="check"
                class="text-green-500"
              />
              <span v-else class="text-gray-500 dark:text-gray-400">{{
                requiresBatchRelayerApproval ? 2 : 1
              }}</span>
            </div>
            <div class="ml-3">
              <span v-if="isTokenApproved">{{ $t('approved') }}</span>
              <span v-else>{{ $t('approve') }} {{ symbolIn }}</span>
            </div>
          </div>
          <div class="mt-3 card-container">
            <div
              class="card-content dark:border-gray-700 text-gray-500 dark:text-gray-400"
            >
              {{ approvalTxCount }}
            </div>
            <div class="ml-3">
              {{ $t('trade') }} {{ fNum(valueIn, 'usd') }} {{ symbolIn }} ->
              {{ symbolOut }}
            </div>
          </div>
        </div>
      </div>
      <BalBtn
        v-if="requiresBatchRelayerApproval && !isApproved"
        class="mt-5"
        :label="$t('approveBatchRelayer')"
        :loading="approvingBatchRelayer"
        :loading-label="`${$t('approveBatchRelayer')}…`"
        color="gradient"
        block
        @click.prevent="approveBatchRelayer"
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
import useBatchRelayerApproval from '@/composables/trade/useBatchRelayerApproval';
import useTokens from '@/composables/useTokens';

import useWeb3 from '@/services/web3/useWeb3';

import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { configService } from '@/services/config/config.service';
import { getAddress } from '@ethersproject/address';

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

    const { tokens } = useTokens();
    const { userNetworkConfig } = useWeb3();

    const isWrap = computed(() => {
      const config = userNetworkConfig.value;
      return (
        addressIn.value === NATIVE_ASSET_ADDRESS &&
        addressOut.value === config.addresses.weth
      );
    });

    const isUnwrap = computed(() => {
      const config = userNetworkConfig.value;
      return (
        addressOut.value === NATIVE_ASSET_ADDRESS &&
        addressIn.value === config.addresses.weth
      );
    });

    const isStETHTrade = computed(
      () =>
        [addressIn.value, addressOut.value].includes(
          getAddress(configService.network.addresses.stETH)
        ) || true
    );

    const tokenApproval = useTokenApproval(addressIn, amountIn, tokens);

    const batchRelayerApproval = useBatchRelayerApproval(
      isStETHTrade.value,
      amountIn
    );

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
      isWrap.value || isUnwrap.value || isEthTrade.value ? false : true
    );

    const requiresBatchRelayerApproval = computed(
      () =>
        (requiresTokenApproval.value &&
          isStETHTrade.value &&
          !batchRelayerApproval.isUnlocked) ||
        true
    );

    const requiresApproval = computed(
      () => requiresTokenApproval.value || requiresBatchRelayerApproval.value
    );

    const isTokenApproved = computed(() =>
      isV1Swap.value
        ? tokenApproval.allowanceState.value.isUnlockedV1
        : tokenApproval.allowanceState.value.isUnlockedV2
    );

    const isBatchRelayerApproved = computed(
      () => batchRelayerApproval.isUnlocked.value
    );

    const isApproved = computed(
      () => isTokenApproved.value || isBatchRelayerApproved.value
    );

    async function approveBatchRelayer(): Promise<void> {
      await batchRelayerApproval.approve();
    }

    async function approveToken(): Promise<void> {
      if (isV1Swap.value) {
        await tokenApproval.approveV1();
      } else {
        await tokenApproval.approveV2();
      }
    }

    const approvingToken = computed(() => tokenApproval.approving.value);

    const approvingBatchRelayer = computed(
      () => batchRelayerApproval.approving.value
    );

    const approvalTxCount = computed(() => {
      if (requiresTokenApproval.value) {
        return requiresBatchRelayerApproval.value ? 3 : 2;
      }
      return 1;
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
      approveBatchRelayer,
      approveToken,
      trade,
      // computed
      requiresApproval,
      requiresTokenApproval,
      requiresBatchRelayerApproval,
      isTokenApproved,
      isBatchRelayerApproved,
      isApproved,
      valueIn,
      symbolIn,
      symbolOut,
      approvingBatchRelayer,
      approvingToken,
      batchRelayerApproval,
      approvalTxCount
    };
  }
});
</script>
<style scoped>
.card-container {
  @apply p-3 flex items-center border rounded-lg dark:border-gray-800;
}
.card-content {
  @apply w-9 h-9 flex items-center justify-center border rounded-full;
}
</style>
