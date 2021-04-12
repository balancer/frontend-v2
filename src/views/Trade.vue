<template>
  <Layout>
    <BalCard class="p-8 max-w-lg mx-auto mt-16">
      <h2 v-text="$t(title)" class="mb-6" />
      <div class="mb-8">
        <div class="grid grid-cols-12 border mb-4 rounded-2xl overflow-hidden">
          <a
            @click="openModalSelectToken('input')"
            class="col-span-4 border-r p-3"
          >
            <span v-if="tokenInAddressInput">
              <Token
                :token="tokens[tokenInAddressInput]"
                :size="32"
                :symbol="true"
              />
            </span>
            <span v-text="$t('select')" v-else />
          </a>
          <div class="col-span-8 px-3 py-2">
            <div class="flex">
              <input
                v-model="tokenInAmountInput"
                @input="handleAmountChange(true, $event.target.value)"
                type="number"
                placeholder="0"
                class="flex-auto"
              />
              <a
                @click="handleMax"
                v-text="$t('max')"
                class="p-1 border rounded text-xs"
              />
            </div>
            <div
              v-if="tokenInAddressInput"
              :class="
                validationStatus === 'INSUFFICIENT_BALANCE' && 'text-red-500'
              "
              class="text-xs"
            >
              Balance:
              {{
                _num(tokens[tokenInAddressInput]?.balance || 0, '0,0.[000000]')
              }}
            </div>
          </div>
        </div>
        <div class="flex mb-4">
          <a @click="handleSwitchTokens">
            <Icon
              :size="24"
              name="refresh"
              class="rounded-full border p-2 inline-block"
            />
          </a>
          <div v-if="rateMessage" class="flex-auto ml-4 my-2">
            <span @click="toggleRate" v-text="rateMessage" />
          </div>
        </div>
        <div class="grid grid-cols-12 border mb-4 rounded-2xl overflow-hidden">
          <a
            @click="openModalSelectToken('output')"
            class="col-span-4 border-r p-3"
          >
            <span v-if="tokenOutAddressInput">
              <Token
                :token="tokens[tokenOutAddressInput]"
                :size="32"
                :symbol="true"
              />
            </span>
            <span v-text="$t('select')" v-else />
          </a>
          <div class="col-span-8 px-3 py-2">
            <input
              v-model="tokenOutAmountInput"
              @input="handleAmountChange(false, $event.target.value)"
              type="number"
              placeholder="0"
              class="w-full"
            />
            <div
              v-if="slippage"
              :class="slippage > 0.02 && 'text-yellow-500'"
              class="text-xs"
            >
              {{ $t('priceImpact') }}:
              {{ _num(slippage > 0.0001 ? slippage : 0.0001, '0,0.[00]%') }}
            </div>
          </div>
        </div>
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
import numeral from 'numeral';
import useAuth from '@/composables/useAuth';
import useTokenApproval from '@/composables/trade/useTokenApproval';
import useValidation from '@/composables/trade/useValidation';
import useSor from '@/composables/trade/useSor';
import initialTokens from '@/constants/initialTokens.json';
import SelectTokenModal from '@/components/modals/SelectTokenModal.vue';
import { ETHER } from '@/constants/tokenlists';

export default defineComponent({
  components: {
    SelectTokenModal
  },

  setup() {
    const store = useStore();
    const { isAuthenticated } = useAuth();

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
      slippage,
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
          message = `1 ${tokenIn.symbol} = ${numeral(rate).format(
            '0,0.[000000]'
          )} ${tokenOut.symbol}`;
        } else {
          const rate = parseFloat(tokenInAmount) / parseFloat(tokenOutAmount);
          message = `1 ${tokenOut.symbol} = ${numeral(rate).format(
            '0,0.[000000]'
          )} ${tokenIn.symbol}`;
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
      tokenInAmountInput.value =
        tokens.value[tokenInAddressInput.value]?.balance || '';
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
      await handleSelectToken(initialTokens[chainId].input);
      modalSelectTokenType.value = 'output';
      await handleSelectToken(initialTokens[chainId].output);
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
      slippage.value = 0;
      await initSor();
      await populateInitialTokens();
    });

    populateInitialTokens();

    return {
      tokens,
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
      slippage
    };
  }
});
</script>
