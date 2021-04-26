<template>
  <BalCard class="relative">
    <template v-slot:header>
      <div class="w-full flex items-center justify-between">
        <h4 class="font-bold">{{ $t(title) }}</h4>
        <TradeSettingsPopover />
      </div>
    </template>
    <div>
      <TradePair
        :token-in-amount-input="tokenInAmount"
        :token-in-address-input="tokenInAddress"
        :token-out-amount-input="tokenOutAmount"
        :token-out-address-input="tokenOutAddress"
        :exact-in="exactIn"
        :price-impact="priceImpact"
        @token-in-amount-change="value => (tokenInAmount = value)"
        @token-in-address-change="value => (tokenInAddress = value)"
        @token-out-amount-change="value => (tokenOutAmount = value)"
        @token-out-address-change="value => (tokenOutAddress = value)"
        @exact-in-change="value => (exactIn = value)"
        @change="handleAmountChange"
      />
      <BalBtn
        v-if="!isAuthenticated"
        :label="$t('connectWallet')"
        block
        @click.prevent="connectWallet"
      />
      <BalBtn v-else-if="errorMessage" :label="errorMessage" block disabled />
      <BalBtn
        v-else-if="requireApproval"
        :label="`${$t('approve')} ${tokens[tokenInAddress].symbol}`"
        :loading="approving"
        :loading-label="
          `${$t('approving')} ${tokens[tokenInAddress].symbol}...`
        "
        block
        @click.prevent="approve"
      />
      <BalBtn
        v-else
        type="submit"
        :label="`${$t(submitLabel)}`"
        :loading="trading"
        :loading-label="$t('confirming')"
        color="gradient"
        block
        @click.prevent="trade"
      />
    </div>
    <SuccessOverlay
      v-if="tradeSuccess"
      :title="$t('tradeSettled')"
      :description="$t('tradeSuccess')"
      :closeLabel="$t('close')"
      :txHash="txHash"
      @close="tradeSuccess = false"
    />
  </BalCard>
</template>

<script lang="ts">
import { ref, defineComponent, computed, watch } from 'vue';
import { useStore } from 'vuex';

import useAuth from '@/composables/useAuth';
import useNumbers from '@/composables/useNumbers';
import useTokenApproval from '@/composables/trade/useTokenApproval';
import useValidation from '@/composables/trade/useValidation';
import useSor from '@/composables/trade/useSor';
import initialTokens from '@/constants/initialTokens.json';
import { ETHER } from '@/constants/tokenlists';

import SuccessOverlay from '../shared/SuccessOverlay.vue';
import TradePair from '@/components/cards/TradeCard/TradePair.vue';
import TradeSettingsPopover from '@/components/popovers/TradeSettingsPopover.vue';

export default defineComponent({
  components: {
    SuccessOverlay,
    TradePair,
    TradeSettingsPopover
  },

  setup() {
    const store = useStore();
    const { isAuthenticated } = useAuth();
    const { fNum, toFiat } = useNumbers();

    const getTokens = (params = {}) =>
      store.getters['registry/getTokens'](params);
    const getConfig = () => store.getters['web3/getConfig']();
    const tokens = computed(() => getTokens({ includeEther: true }));

    const tokenInAddress = ref('');
    const tokenInAmount = ref('');
    const tokenOutAddress = ref('');
    const tokenOutAmount = ref('');
    const tradeSuccess = ref(false);
    const txHash = ref('');

    const isWrap = computed(() => {
      const config = getConfig();
      return (
        tokenInAddress.value === ETHER.address &&
        tokenOutAddress.value === config.addresses.weth
      );
    });

    const isUnwrap = computed(() => {
      const config = getConfig();
      return (
        tokenOutAddress.value === ETHER.address &&
        tokenInAddress.value === config.addresses.weth
      );
    });

    // COMPOSABLES
    const {
      approving,
      approveV1,
      approveV2,
      allowanceState
    } = useTokenApproval(tokenInAddress, tokenInAmount, tokens);
    const {
      trading,
      trade,
      initSor,
      handleAmountChange,
      priceImpact,
      exactIn,
      sorReturn,
      latestTxHash,
      fetchPools
    } = useSor(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      tokens,
      allowanceState,
      isWrap,
      isUnwrap
    );
    const { validationStatus, errorMessage } = useValidation(
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      tokens
    );

    const requireApproval = computed(() => {
      if (isUnwrap.value) return false;
      return sorReturn.value.isV1swap
        ? !allowanceState.value.isUnlockedV1
        : !allowanceState.value.isUnlockedV2;
    });

    const title = computed(() => {
      if (isWrap.value) return 'wrap';
      if (isUnwrap.value) return 'unwrap';
      return 'trade';
    });

    const submitLabel = computed(() => {
      if (isWrap.value) return 'wrap';
      if (isUnwrap.value) return 'unwrap';
      return 'swap';
    });

    function connectWallet() {
      store.commit('web3/setAccountModal', true);
    }

    async function populateInitialTokens(): Promise<void> {
      const { chainId } = getConfig();
      tokenInAddress.value = initialTokens[chainId].input;
      tokenOutAddress.value = initialTokens[chainId].output;
    }

    async function approve(): Promise<void> {
      if (sorReturn.value.isV1swap) {
        await approveV1();
      } else {
        await approveV2();
      }
    }

    watch(getConfig, async () => {
      await initSor();
    });

    watch(tokenInAddress, () => {
      handleAmountChange();
    });

    watch(tokenOutAddress, () => {
      handleAmountChange();
    });

    watch(latestTxHash, () => {
      // Refresh SOR pools
      fetchPools();
      txHash.value = latestTxHash.value;
      tradeSuccess.value = true;
    });

    populateInitialTokens();

    return {
      fNum,
      toFiat,
      tokens,
      title,
      submitLabel,
      isAuthenticated,
      connectWallet,
      tokenInAddress,
      tokenInAmount,
      tokenOutAddress,
      tokenOutAmount,
      exactIn,
      handleAmountChange,
      validationStatus,
      errorMessage,
      requireApproval,
      approving,
      sorReturn,
      approve,
      trading,
      trade,
      txHash,
      tradeSuccess,
      priceImpact
    };
  }
});
</script>
