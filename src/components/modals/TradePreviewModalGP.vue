<template>
  <BalModal
    :show="open"
    @close="onClose"
    :title="$t('previewTradeTransactions')"
  >
    <div>
      <div
        class="-mx-4 p-4 flex items-center border-b border-t dark:border-gray-700"
      >
        <BalAssetSet
          :addresses="[addressIn, addressOut]"
          :size="30"
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
        <div v-if="formattedFeeAmount > 0" class="mt-6 mb-3 text-sm">
          Fee: {{ fNum(formattedFeeAmount, 'token') }}
          {{ symbolIn }}
        </div>
        <div class="mt-6 mb-3 text-sm">
          Requires {{ requiresApproval ? 2 : 1 }}
          {{ requiresApproval ? 'transactions' : 'transaction' }}:
        </div>
        <div>
          <div
            v-if="requiresApproval"
            class="p-3 flex items-center border rounded-lg"
          >
            <div
              class="w-9 h-9 flex items-center justify-center border rounded-full text-green-500"
            >
              <BalIcon v-if="isApproved" name="check" class="text-green-500" />
              <span v-else class="text-gray-500">1</span>
            </div>
            <div class="ml-3">
              <span v-if="isApproved">{{ $t('approved') }}</span>
              <span v-else>{{ $t('approve') }}</span>
            </div>
          </div>
          <div class="mt-3 p-3 flex items-center border rounded-lg">
            <div
              class="w-9 h-9 flex items-center justify-center border rounded-full text-gray-500"
            >
              {{ requiresApproval ? 2 : 1 }}
            </div>
            <div class="ml-3">
              {{ $t('trade') }} {{ fNum(valueIn, 'usd') }} {{ symbolIn }} ->
              {{ symbolOut }}
            </div>
          </div>
        </div>
      </div>
      <BalBtn
        v-if="requiresApproval && !isApproved"
        class="mt-5"
        :label="`${$t('approve')} ${symbolIn}`"
        :loading="approving"
        :loading-label="`${$t('approving')} ${symbolIn}…`"
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
      <div class="m-1" v-if="orderId">
        <BalLink :href="gnosisExplorer.orderLink(orderId)" external class="m1">
          Track order
        </BalLink>
      </div>
    </div>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { useStore } from 'vuex';

import { ETHER } from '@/constants/tokenlists';

import useNumbers from '@/composables/useNumbers';
import useTokenApprovalGP from '@/composables/trade/useTokenApprovalGP';
import useGnosisProtocol from '@/composables/useGnosisProtocol';

export default defineComponent({
  emits: ['trade', 'close'],
  props: {
    open: {
      type: Boolean,
      default: false
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
    },
    orderId: {
      type: String
    },
    formattedFeeAmount: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const store = useStore();
    const { fNum, toFiat } = useNumbers();
    const { gnosisExplorer } = useGnosisProtocol();

    const { addressIn, amountIn, addressOut } = toRefs(props);

    const getTokens = (params = {}) =>
      store.getters['registry/getTokens'](params);
    const getConfig = () => store.getters['web3/getConfig']();
    const tokens = computed(() => getTokens({ includeEther: true }));

    const isWrap = computed(() => {
      const config = getConfig();
      return (
        addressIn.value === ETHER.address &&
        addressOut.value === config.addresses.weth
      );
    });

    const isUnwrap = computed(() => {
      const config = getConfig();
      return (
        addressOut.value === ETHER.address &&
        addressIn.value === config.addresses.weth
      );
    });

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

    const isEthTrade = computed(() => addressIn.value === ETHER.address);

    const requiresApproval = computed(() => {
      if (isWrap.value || isUnwrap.value || isEthTrade.value) return false;
      return true;
    });

    const { approving, allowanceState, approve } = useTokenApprovalGP(
      addressIn,
      amountIn,
      tokens
    );

    const isApproved = computed(() => {
      return allowanceState.value.isUnlocked;
    });

    function trade() {
      emit('trade');
    }

    function onClose() {
      emit('close');
    }

    return {
      fNum,
      requiresApproval,
      isApproved,
      valueIn,
      symbolIn,
      symbolOut,
      onClose,
      approve,
      approving,
      trade,
      gnosisExplorer
    };
  }
});
</script>
