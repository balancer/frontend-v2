<template>
  <Layout>
    <BalCard class="p-8 max-w-lg mx-auto mt-16" :title="$t(title)">
      <div class="mb-8">
        <BalTextInput
          :name="'tokenIn'"
          v-model="tokenInAmountInput"
          @input="value => handleAmountChange(true, value)"
          type="number"
          min="0"
          step="any"
          placeholder="0"
          validate-on="input"
          prepend-border
        >
          <template v-slot:prepend>
            <div
              class="flex items-center w-24 cursor-pointer"
              @click="openModalSelectToken('input')"
            >
              <Token :token="tokens[tokenInAddressInput]" />
              <div
                class="flex flex-col ml-3 w-14 font-medium text-sm leading-none truncate"
              >
                <BalTooltip
                  v-if="tokens[tokenInAddressInput].symbol.length > 5"
                >
                  <template v-slot:activator>
                    <span>
                      {{ tokens[tokenInAddressInput].symbol }}
                    </span>
                  </template>
                  <div>
                    {{ tokens[tokenInAddressInput].symbol }}
                  </div>
                </BalTooltip>
                <span v-else>
                  {{ tokens[tokenInAddressInput].symbol }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:info>
            <div class="cursor-pointer" @click="handleMax">
              {{ $t('max') }}: {{ balanceLabel }}
            </div>
          </template>
        </BalTextInput>
        <div class="flex mb-4">
          <BalBtn color="gray" flat circle @click="handleSwitchTokens">
            <BalIcon name="shuffle" size="sm" />
          </BalBtn>
          <div v-if="rateMessage" class="flex-auto ml-4 my-2">
            <span
              class="text-sm text-gray-500 cursor-pointer"
              @click="toggleRate"
              v-text="rateMessage"
            />
          </div>
        </div>
        <BalTextInput
          :name="'tokenOut'"
          v-model="tokenOutAmountInput"
          @input="value => handleAmountChange(false, value)"
          type="number"
          min="0"
          step="any"
          placeholder="0"
          validate-on="input"
          prepend-border
        >
          <template v-slot:prepend>
            <div
              class="flex items-center w-24 cursor-pointer"
              @click="openModalSelectToken('output')"
            >
              <Token :token="tokens[tokenOutAddressInput]" />
              <div
                class="flex flex-col ml-3 w-14 font-medium text-sm leading-none truncate"
              >
                <BalTooltip
                  v-if="tokens[tokenOutAddressInput].symbol.length > 5"
                >
                  <template v-slot:activator>
                    <span>
                      {{ tokens[tokenOutAddressInput].symbol }}
                    </span>
                  </template>
                  <div>
                    {{ tokens[tokenOutAddressInput].symbol }}
                  </div>
                </BalTooltip>
                <span v-else>
                  {{ tokens[tokenOutAddressInput].symbol }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:info>
            <div>
              {{ $t('priceImpact') }}:
              {{ fNum(priceImpact > 0.0001 ? priceImpact : 0.0001, 'percent') }}
            </div>
          </template>
        </BalTextInput>
      </div>
      <BalBtn
        v-if="!isAuthenticated"
        label="Connect wallet"
        block
        @click.prevent="connectWallet"
      />
      <BalBtn v-else-if="errorMessage" :label="errorMessage" block disabled />
      <BalBtn
        v-else-if="requireApproval"
        :label="`Unlock ${tokens[tokenInAddressInput].symbol} ${versionLabel}`"
        :loading="approving"
        :loading-label="`Unlocking ${tokens[tokenInAddressInput].symbol}...`"
        block
        @click.prevent="approve"
      />
      <BalBtn
        v-else
        type="submit"
        :label="`${$t(submitLabel)} ${versionLabel}`"
        :loading="trading"
        loading-label="Confirming..."
        color="gradient"
        block
        @click.prevent="trade"
      />
    </BalCard>
    <teleport to="#modal">
      <SelectTokenModal
        :open="modalSelectTokenIsOpen"
        :excludedTokens="[tokenInAddressInput, tokenOutAddressInput]"
        @close="modalSelectTokenIsOpen = false"
        @select="handleSelectToken"
        include-ether
      />
    </teleport>
  </Layout>
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
import SelectTokenModal from '@/components/modals/SelectTokenModal.vue';
import { ETHER } from '@/constants/tokenlists';

const ETH_BUFFER = 0.1;

export default defineComponent({
  components: {
    SelectTokenModal
  },

  setup() {
    const store = useStore();
    const { isAuthenticated } = useAuth();
    const { fNum } = useNumbers();

    const tokenInAddressInput = ref('');
    const tokenInAmountInput = ref('');
    const tokenOutAddressInput = ref('');
    const tokenOutAmountInput = ref('');
    const modalSelectTokenType = ref('input');
    const modalSelectTokenIsOpen = ref(false);
    const isInRate = ref(true);

    const getTokens = (params = {}) =>
      store.getters['registry/getTokens'](params);
    const getConfig = () => store.getters['web3/getConfig']();
    const tokens = computed(() => getTokens({ includeEther: true }));

    const isWrap = computed(() => {
      const config = getConfig();
      return (
        tokenInAddressInput.value === ETHER.address &&
        tokenOutAddressInput.value === config.addresses.weth
      );
    });

    const isUnwrap = computed(() => {
      const config = getConfig();
      return (
        tokenOutAddressInput.value === ETHER.address &&
        tokenInAddressInput.value === config.addresses.weth
      );
    });

    // COMPOSABLES
    const {
      approving,
      approveV1,
      approveV2,
      allowanceState
    } = useTokenApproval(tokenInAddressInput, tokenInAmountInput, tokens);
    const {
      trading,
      trade,
      initSor,
      handleAmountChange,
      priceImpact,
      sorReturn
    } = useSor(
      tokenInAddressInput,
      tokenInAmountInput,
      tokenOutAddressInput,
      tokenOutAmountInput,
      tokens,
      allowanceState,
      isWrap,
      isUnwrap
    );
    const { validationStatus, errorMessage } = useValidation(
      tokenInAddressInput,
      tokenInAmountInput,
      tokenOutAddressInput,
      tokenOutAmountInput,
      tokens
    );

    const requireApproval = computed(() => {
      if (isUnwrap.value) return false;
      return sorReturn.value.isV1swap
        ? !allowanceState.value.isUnlockedV1
        : !allowanceState.value.isUnlockedV2;
    });

    const balanceLabel = computed(
      () => tokens.value[tokenInAddressInput.value]?.balance
    );

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

    const versionLabel = computed(() => {
      if (submitLabel.value === 'swap')
        return sorReturn.value.isV1swap ? 'V1' : 'V2';
      return '';
    });

    const rateMessage = computed(() => {
      let message = '';
      if (
        tokenInAddressInput.value &&
        tokenOutAddressInput.value &&
        parseFloat(tokenInAmountInput.value) > 0 &&
        parseFloat(tokenOutAmountInput.value) > 0
      ) {
        const tokenIn = tokens.value[tokenInAddressInput.value];
        const tokenOut = tokens.value[tokenOutAddressInput.value];
        const tokenInAmount = tokenInAmountInput.value;
        const tokenOutAmount = tokenOutAmountInput.value;
        if (isInRate.value) {
          const rate = parseFloat(tokenOutAmount) / parseFloat(tokenInAmount);
          message = `1 ${tokenIn.symbol} = ${fNum(rate, 'token')} ${
            tokenOut.symbol
          }`;
        } else {
          const rate = parseFloat(tokenInAmount) / parseFloat(tokenOutAmount);
          message = `1 ${tokenOut.symbol} = ${fNum(rate, 'token')} ${
            tokenIn.symbol
          }`;
        }
      }
      return message;
    });

    function toggleRate(): void {
      isInRate.value = !isInRate.value;
    }

    function openModalSelectToken(type: string): void {
      modalSelectTokenIsOpen.value = true;
      modalSelectTokenType.value = type;
    }

    function connectWallet() {
      store.commit('web3/setAccountModal', true);
    }

    function handleSelectToken(address: string): void {
      if (modalSelectTokenType.value === 'input') {
        tokenInAddressInput.value = address;
        handleAmountChange(false, tokenOutAmountInput.value);
      } else {
        tokenOutAddressInput.value = address;
        handleAmountChange(true, tokenInAmountInput.value);
      }
      store.dispatch('registry/injectTokens', [address]);
    }

    function handleMax(): void {
      const balance = tokens.value[tokenInAddressInput.value]?.balance || '0';
      const balanceNumber = parseFloat(balance);
      tokenInAmountInput.value =
        tokenInAddressInput.value !== ETHER.address
          ? balance
          : balanceNumber > ETH_BUFFER
          ? (balanceNumber - ETH_BUFFER).toString()
          : '0';
      handleAmountChange(true, tokenInAmountInput.value);
    }

    function handleSwitchTokens(): void {
      const tokenInAddressInputSave = tokenInAddressInput.value;
      const tokenInAmountInputSave = tokenInAmountInput.value;
      tokenInAddressInput.value = tokenOutAddressInput.value;
      tokenOutAddressInput.value = tokenInAddressInputSave;
      tokenInAmountInput.value = tokenOutAmountInput.value;
      tokenOutAmountInput.value = tokenInAmountInputSave;
      handleAmountChange(false, tokenOutAmountInput.value);
    }

    async function populateInitialTokens(): Promise<void> {
      const { chainId } = getConfig();
      modalSelectTokenType.value = 'input';
      handleSelectToken(initialTokens[chainId].input);
      modalSelectTokenType.value = 'output';
      handleSelectToken(initialTokens[chainId].output);
    }

    async function approve(): Promise<void> {
      if (sorReturn.value.isV1swap) {
        await approveV1();
      } else {
        await approveV2();
      }
    }

    watch(getConfig, async () => {
      tokenInAddressInput.value = '';
      tokenInAmountInput.value = '';
      tokenOutAddressInput.value = '';
      tokenOutAmountInput.value = '';
      priceImpact.value = 0;
      await initSor();
      await populateInitialTokens();
    });

    populateInitialTokens();

    return {
      fNum,
      tokens,
      balanceLabel,
      title,
      submitLabel,
      versionLabel,
      modalSelectTokenIsOpen,
      isAuthenticated,
      connectWallet,
      tokenInAddressInput,
      tokenInAmountInput,
      tokenOutAddressInput,
      tokenOutAmountInput,
      rateMessage,
      openModalSelectToken,
      handleSelectToken,
      handleMax,
      handleSwitchTokens,
      handleAmountChange,
      toggleRate,
      validationStatus,
      errorMessage,
      requireApproval,
      approving,
      sorReturn,
      approve,
      trading,
      trade,
      priceImpact
    };
  }
});
</script>
