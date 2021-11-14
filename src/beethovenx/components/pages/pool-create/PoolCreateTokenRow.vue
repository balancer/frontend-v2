<template>
  <div class="border border-gray-700 rounded-lg">
    <BalTextInput
      name="pool-token-amount"
      :model-value="tokenAmountInput"
      @input="value => handleAmountChange(value)"
      type="number"
      :decimal-limit="tokenDecimals"
      min="0"
      step="any"
      placeholder="0"
      validate-on="input"
      prepend-border
      :no-margin="true"
    >
      <template v-slot:prepend>
        <div class="flex items-center h-full">
          <div
            class="flex items-center w-32 h-full cursor-pointer group"
            @click="openModalSelectToken('input')"
          >
            <BalAsset
              v-if="tokenAddressInput"
              :address="tokenAddressInput"
              :size="28"
            />
            <div class="flex flex-col ml-3 w-24 leading-none truncate">
              <BalTooltip v-if="tokenSymbol.length > 5">
                <template v-slot:activator>
                  <span class="font-bold">
                    {{ tokenSymbol }}
                  </span>
                </template>
                <div>
                  {{ tokenSymbol }}
                </div>
              </BalTooltip>
              <span v-else class="font-bold">
                {{ tokenSymbol }}
              </span>
            </div>
            <BalIcon
              :name="'chevron-down'"
              :size="'sm'"
              class="text-green-500"
            />
          </div>
          <div class="w-24 border-l dark:border-gray-850 ml-4">
            <BalTextInput
              name="pool-token-weight"
              :model-value="tokenWeightInput"
              @input="value => handleWeightChange(value)"
              type="number"
              :decimal-limit="4"
              min="0"
              step="any"
              placeholder="0"
              validate-on="input"
              prepend-border
              :no-margin="true"
            >
              <template v-slot:info>Weight (%)</template>
            </BalTextInput>
          </div>
        </div>
      </template>
      <template v-slot:info>
        <div class="cursor-pointer" @click="handleMax">
          {{ $t('balance') }}: {{ fNum(balanceLabel, 'token') }}
        </div>
      </template>
      <template v-slot:append>
        <div class="p-2 h-full flex items-center">
          <BalBtn
            size="xs"
            color="white"
            class="mr-4 h-full"
            @click="approveV2"
            v-if="!isUnlockedV2"
            :loading="approving"
            loading-label="Approving..."
          >
            <span>Approve</span>
          </BalBtn>

          <BalBtn
            size="xs"
            color="white"
            @click="handleTokenDelete"
            class="h-full"
            :disabled="!canDelete"
          >
            <BalIcon
              name="trash"
              :class="[canDelete ? 'text-red-500' : 'text-gray-500']"
            />
          </BalBtn>
        </div>
      </template>
    </BalTextInput>
  </div>
  <teleport to="#modal">
    <SelectTokenModal
      v-if="modalSelectTokenIsOpen"
      :excludedTokens="[tokenAddressInput, nativeAssetAddress]"
      @close="modalSelectTokenIsOpen = false"
      @select="handleSelectToken"
      include-ether
    />
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, ref, toRefs, watch } from 'vue';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import useWeb3 from '@/services/web3/useWeb3';
import useTokenApproval from '@/composables/trade/useTokenApproval';

const ETH_BUFFER = 0.1;

export default defineComponent({
  components: { BalIcon, SelectTokenModal },
  props: {
    tokenAmountInput: {
      type: String,
      required: true
    },
    tokenWeightInput: {
      type: String,
      required: true
    },
    tokenAddressInput: {
      type: String,
      required: true
    },
    canDelete: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    'tokenAddressChange',
    'tokenAmountChange',
    'tokenWeightChange',
    'tokenDelete',
    'tokenApproved'
  ],

  setup(props, { emit }) {
    const { tokens, balances, injectTokens } = useTokens();
    const { fNum, toFiat } = useNumbers();
    const { appNetworkConfig } = useWeb3();
    const { tokenAmountInput, tokenAddressInput } = toRefs(props);
    const {
      approving,
      approved,
      isUnlockedV2,
      approveV2,
      isLoading: isLoadingApprovals
    } = useTokenApproval(tokenAddressInput, tokenAmountInput, tokens);

    const tokenValue = computed(() =>
      toFiat(tokenAmountInput.value, tokenAddressInput.value)
    );

    const tokenSymbol = computed(() => {
      const token = tokens.value[tokenAddressInput.value];
      const symbol = token ? token.symbol : '';
      return symbol;
    });

    const tokenDecimals = computed(() => {
      const decimals = tokens.value[tokenAddressInput.value]
        ? tokens.value[tokenAddressInput.value].decimals
        : 18;
      return decimals;
    });

    const isInRate = ref(true);
    const modalSelectTokenType = ref('input');
    const modalSelectTokenIsOpen = ref(false);

    function handleMax(): void {
      const balance = balances.value[tokenAddressInput.value] || '0';
      const balanceNumber = parseFloat(balance);
      const maxAmount =
        tokenAddressInput.value !== NATIVE_ASSET_ADDRESS
          ? balance
          : balanceNumber > ETH_BUFFER
          ? (balanceNumber - ETH_BUFFER).toString()
          : '0';
      handleAmountChange(maxAmount);
    }

    function handleAmountChange(value: string): void {
      emit('tokenAmountChange', value);
    }

    function handleWeightChange(value: string): void {
      emit('tokenWeightChange', value);
    }

    function handleSelectToken(address: string): void {
      emit('tokenAddressChange', address);
      injectTokens([address]);
    }

    function handleTokenDelete(): void {
      emit('tokenDelete');
    }

    function toggleRate(): void {
      isInRate.value = !isInRate.value;
    }

    function openModalSelectToken(type: string): void {
      modalSelectTokenIsOpen.value = true;
      modalSelectTokenType.value = type;
    }

    const balanceLabel = computed(
      () => balances.value[tokenAddressInput.value]
    );

    watch(isUnlockedV2, newVal => {
      if (newVal) {
        emit('tokenApproved', props.tokenAddressInput);
      }
    });

    return {
      fNum,
      handleMax,
      balanceLabel,
      handleAmountChange,
      toggleRate,
      tokenValue,
      tokenSymbol,
      modalSelectTokenIsOpen,
      openModalSelectToken,
      handleSelectToken,
      handleWeightChange,
      handleTokenDelete,
      tokenDecimals,
      nativeAssetAddress: appNetworkConfig.nativeAsset.address,
      approved,
      approving,
      isLoadingApprovals,
      isUnlockedV2,
      approveV2
    };
  }
});
</script>
