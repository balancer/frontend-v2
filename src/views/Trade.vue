<template>
  <div class="px-4 md:px-0">
    <div
      class="max-w-full sm:max-w-lg md:max-w-md lg:max-w-sm mx-auto mt-8 lg:mt-16"
    >
      <BalCard>
        <template v-slot:header>
          <h4 class="font-bold">{{ $t(title) }}</h4>
        </template>
        <div class="mb-8">
          <div
            class="p-2 flex justify-between text-sm rounded-t-lg border border-b-0"
          >
            <div>{{ $t('send') }}</div>
            <div v-if="tokenInValue > 0" class="text-gray-500">
              {{ fNum(tokenInValue, 'usd') }}
            </div>
          </div>
          <BalTextInput
            name="tokenIn"
            v-model="tokenInAmountInput"
            @input="value => handleAmountChange(true, value)"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            validate-on="input"
            square-top
            prepend-border
          >
            <template v-slot:prepend>
              <div
                class="flex items-center w-28 h-full cursor-pointer"
                @click="openModalSelectToken('input')"
              >
                <Token :token="tokens[tokenInAddressInput]" :size="28" />
                <div class="flex flex-col ml-3 w-14 leading-none truncate">
                  <BalTooltip
                    v-if="tokens[tokenInAddressInput].symbol.length > 5"
                  >
                    <template v-slot:activator>
                      <span class="font-bold">
                        {{ tokens[tokenInAddressInput].symbol }}
                      </span>
                    </template>
                    <div>
                      {{ tokens[tokenInAddressInput].symbol }}
                    </div>
                  </BalTooltip>
                  <span v-else class="font-bold">
                    {{ tokens[tokenInAddressInput].symbol }}
                  </span>
                </div>
                <BalIcon
                  :name="'chevron-down'"
                  :size="'sm'"
                  class="text-blue-500"
                />
              </div>
            </template>
            <template v-slot:info>
              <div class="cursor-pointer" @click="handleMax">
                {{ $t('balance') }}: {{ formatBalance }}
              </div>
            </template>
            <template v-slot:append>
              <div class="p-2">
                <BalBtn size="xs" color="white" @click="handleMax">
                  {{ $t('max') }}
                </BalBtn>
              </div>
            </template>
          </BalTextInput>
          <div class="flex items-center mb-4">
            <PairToggle @toggle="handleSwitchTokens" />
            <div v-if="rateMessage" class="flex-auto ml-4">
              <span
                class="text-sm text-gray-500 cursor-pointer"
                @click="toggleRate"
                v-text="rateMessage"
              />
            </div>
          </div>
          <div
            class="p-2 flex justify-between text-sm rounded-t-lg border border-b-0"
          >
            <div>{{ $t('receive') }}</div>
            <div v-if="tokenOutValue > 0" class="text-gray-500">
              {{ fNum(tokenOutValue, 'usd') }}
            </div>
          </div>
          <BalTextInput
            name="tokenOut"
            v-model="tokenOutAmountInput"
            @input="value => handleAmountChange(false, value)"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            validate-on="input"
            prepend-border
            square-top
          >
            <template v-slot:prepend>
              <div
                class="flex items-center w-28 h-full cursor-pointer"
                @click="openModalSelectToken('output')"
              >
                <Token :token="tokens[tokenOutAddressInput]" :size="28" />
                <div class="flex flex-col ml-3 w-14 leading-none truncate">
                  <BalTooltip
                    v-if="tokens[tokenOutAddressInput].symbol.length > 5"
                  >
                    <template v-slot:activator>
                      <span class="font-bold">
                        {{ tokens[tokenOutAddressInput].symbol }}
                      </span>
                    </template>
                    <div>
                      {{ tokens[tokenOutAddressInput].symbol }}
                    </div>
                  </BalTooltip>
                  <span v-else class="font-bold">
                    {{ tokens[tokenOutAddressInput].symbol }}
                  </span>
                </div>
                <BalIcon
                  :name="'chevron-down'"
                  :size="'sm'"
                  class="text-blue-500"
                />
              </div>
            </template>
            <template v-slot:info>
              <div>
                {{ $t('priceImpact') }}:
                {{
                  fNum(priceImpact > 0.0001 ? priceImpact : 0.0001, 'percent')
                }}
              </div>
            </template>
          </BalTextInput>
        </div>
        <BalBtn
          v-if="!isAuthenticated"
          :label="$t('connectWallet')"
          block
          @click.prevent="connectWallet"
        />
        <BalBtn
          v-else-if="requireApproval"
          :label="`${$t('approve')} ${tokens[tokenInAddressInput].symbol}`"
          :loading="approving"
          :loading-label="
            `${$t('approving')} ${tokens[tokenInAddressInput].symbol}...`
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
      </BalCard>
    </div>
    <teleport to="#modal">
      <SelectTokenModal
        :open="modalSelectTokenIsOpen"
        :excludedTokens="[tokenInAddressInput, tokenOutAddressInput]"
        @close="modalSelectTokenIsOpen = false"
        @select="handleSelectToken"
        include-ether
      />
    </teleport>
  </div>
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
import PairToggle from '@/components/PairToggle.vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal.vue';

const ETH_BUFFER = 0.1;

export default defineComponent({
  components: {
    PairToggle,
    SelectTokenModal
  },

  setup() {
    const store = useStore();
    const { isAuthenticated } = useAuth();
    const { fNum, toFiat } = useNumbers();

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

    const tokenInValue = computed(() =>
      toFiat(tokenInAmountInput.value, tokenInAddressInput.value)
    );
    const tokenOutValue = computed(() =>
      toFiat(tokenOutAmountInput.value, tokenOutAddressInput.value)
    );

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

    const formatBalance = computed(() =>
      fNum(tokens.value[tokenInAddressInput.value]?.balance, 'token')
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
      toFiat,
      tokens,
      formatBalance,
      title,
      submitLabel,
      modalSelectTokenIsOpen,
      isAuthenticated,
      connectWallet,
      tokenInAddressInput,
      tokenInAmountInput,
      tokenInValue,
      tokenOutAddressInput,
      tokenOutAmountInput,
      tokenOutValue,
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
