<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="mb-8">
      <img src="~@/beethovenx/assets/images/pool-composer.svg" class="-ml-4" />
      <ul class="list-disc list-inside ml-2">
        <li>An investment pool can be created with 2-8 tokens.</li>
        <li>The weights should add up to 100%.</li>
        <li>
          Initial balances should be in line with your weights or the pool will
          get drained.
        </li>
      </ul>
    </div>
    <BalCard class="pt-2 relative">
      <PoolCreateDefinitionFields
        :pool-name="poolName"
        :pool-symbol="poolSymbol"
        :pool-owner="poolOwner"
        :swap-fee-percentage="swapFeePercentage"
        @poolNameChange="handlePoolNameChange"
        @poolSymbolChange="handlePoolSymbolChange"
        @poolOwnerChange="handlePoolOwnerChange"
        @poolSwapFeePercentageChange="handleSwapFeePercentageChange"
        @isInputValid="handleIsInputValid"
      />

      <div class="font-medium mb-1">Tokens</div>
      <div v-if="tokenListsLoaded">
        <div class="mb-3" v-for="(token, idx) in poolTokens" :key="idx">
          <PoolCreateTokenRow
            :token-address-input="token.address"
            :token-amount-input="token.amount"
            :token-weight-input="token.weight"
            :can-delete="poolTokens.length > 2"
            @token-delete="() => deleteToken(idx)"
            @token-address-change="value => tokenAddressChange(value, idx)"
            @token-amount-change="value => tokenAmountChange(value, idx)"
            @token-weight-change="value => tokenWeightChange(value, idx)"
            @token-approved="address => handleTokenApproved(address)"
            :has-token-weight="true"
          />
        </div>
      </div>

      <div class="grid grid-cols-3 mt-4 items-center">
        <div></div>
        <div class="flex-1 flex justify-center">
          <div>
            <BalAlert
              v-if="tokensError"
              type="error"
              class="pl-4 pr-6 py-1"
              size="sm"
              :title="tokensError.header"
              :description="tokensError.body"
              block
            />
          </div>
        </div>
        <div class="flex justify-end pt-1 pb-2">
          <BalBtn
            color="green"
            :disabled="poolTokens.length === 8"
            @click="addToken"
          >
            <BalIcon name="plus" />
          </BalBtn>
        </div>
      </div>
      <div
        v-if="editingDisabled && !poolCreateComplete"
        class="w-full h-full absolute top-0 left-0"
      >
        <div
          class="bg-gray-850 w-full h-full absolute top-0 left-0 rounded-lg opacity-25"
        />
        <div class="text-white absolute left-4 bottom-4 text-yellow-500">
          Editing is disabled during pool creation
        </div>
      </div>
      <PoolCreateSuccessOverlay v-if="poolCreateComplete" :pool-id="poolId" />
    </BalCard>

    <PoolCreateActions
      :pool-name="poolName"
      :pool-symbol="poolSymbol"
      :pool-owner="poolOwner"
      :swap-fee-percentage="swapFeePercentage"
      :can-create-pool="canCreatePool"
      :pool-tokens="poolTokens"
      @create-pool-triggered="handlePoolCreateTriggered"
      @create-pool-error="handlePoolCreateError"
      @created-pool="handlePoolCreated"
      @verified-pool="handlePoolVerified"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';
import useTokenLists from '@/composables/useTokenLists';
import PoolCreateTokenRow from '@/beethovenx/components/pages/pool-create/PoolCreateTokenRow.vue';
import { getAddress } from '@ethersproject/address';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import { remove } from 'lodash';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import PoolCreateDefinitionFields from '@/beethovenx/components/pages/pool-create/PoolCreateDefinitionFields.vue';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';
import { getTokensErrorFromInputs } from '@/beethovenx/utils/poolCreateHelper';
import PoolCreateActions from '@/beethovenx/components/pages/pool-create/PoolCreateActions.vue';
import PoolCreateSuccessOverlay from '@/beethovenx/components/pages/pool-create/PoolCreateSuccessOverlay.vue';
import { PoolTokenInput } from '@/beethovenx/services/pool/creator/pool-creator.service';

export default defineComponent({
  components: {
    PoolCreateActions,
    PoolCreateDefinitionFields,
    BalIcon,
    BalBtn,
    BalCard,
    PoolCreateTokenRow,
    BalAlert,
    PoolCreateSuccessOverlay
  },

  setup() {
    const store = useStore();
    const { loadingTokenLists, tokenListsLoaded } = useTokenLists();
    const { appNetworkConfig } = useWeb3();
    const { tokens, balances, approvalRequired } = useTokens();
    const appLoading = computed(() => store.state.app.loading);
    const poolName = ref('');
    const poolSymbol = ref('');
    const swapFeePercentage = ref('0.25');
    const isDefinitionInputValid = ref(false);
    const editingDisabled = ref(false);
    const poolId = ref('');
    const poolCreateComplete = ref(false);
    const poolOwner = ref(appNetworkConfig.addresses.defaultPoolOwner);
    const approvedTokens = ref<string[]>([]);

    const poolTokens = ref<PoolTokenInput[]>([
      {
        address: getAddress(appNetworkConfig.addresses.weth),
        weight: '50',
        amount: ''
      },
      {
        address: getAddress(appNetworkConfig.addresses.usdc),
        weight: '50',
        amount: ''
      }
    ]);

    const tokensError = computed(() =>
      getTokensErrorFromInputs(
        poolTokens.value,
        tokens.value,
        balances.value,
        approvedTokens.value,
        approvalRequired
      )
    );

    const canCreatePool = computed(() => {
      return !tokensError.value && isDefinitionInputValid.value;
    });

    function addToken() {
      poolTokens.value.push({
        address: getAddress(appNetworkConfig.addresses.weth),
        weight: '50',
        amount: ''
      });
    }

    function deleteToken(idx: number) {
      remove(poolTokens.value, (token, index) => idx === index);
    }

    function tokenAddressChange(value: string, idx: number) {
      poolTokens.value[idx].address = value;
    }

    function tokenAmountChange(value: string, idx: number) {
      poolTokens.value[idx].amount = value;
    }

    function tokenWeightChange(value: string, idx: number) {
      poolTokens.value[idx].weight = value;
    }

    function handlePoolNameChange(value: string) {
      poolName.value = value;
    }

    function handlePoolSymbolChange(value: string) {
      poolSymbol.value = value.toUpperCase();
    }

    function handlePoolOwnerChange(value: string) {
      poolOwner.value = value;
    }

    function handleSwapFeePercentageChange(value: string) {
      swapFeePercentage.value = value;
    }

    function handleIsInputValid(valid: boolean) {
      isDefinitionInputValid.value = valid;
    }

    function handleTokenApproved(tokenAddress: string) {
      approvedTokens.value.push(tokenAddress);
    }

    function handlePoolCreateTriggered() {
      editingDisabled.value = true;
    }

    function handlePoolCreated(id: string) {
      editingDisabled.value = true;
      poolId.value = id;
    }

    function handlePoolCreateError() {
      editingDisabled.value = false;
    }

    function handlePoolVerified() {
      poolCreateComplete.value = true;
    }

    return {
      appLoading,
      loadingTokenLists,
      poolTokens,
      addToken,
      deleteToken,
      tokenAddressChange,
      tokenAmountChange,
      tokenWeightChange,
      poolName,
      poolSymbol,
      poolOwner,
      swapFeePercentage,
      handlePoolNameChange,
      handlePoolSymbolChange,
      handlePoolOwnerChange,
      tokenListsLoaded,
      handleSwapFeePercentageChange,
      handleIsInputValid,
      tokensError,
      canCreatePool,
      handleTokenApproved,
      handlePoolCreateTriggered,
      handlePoolCreated,
      handlePoolCreateError,
      handlePoolVerified,
      poolCreateComplete,
      editingDisabled,
      poolId
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
