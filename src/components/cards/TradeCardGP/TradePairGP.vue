<template>
  <div>
    <div
      class="p-2 flex justify-between text-sm rounded-t-lg border border-b-0"
    >
      <div>{{ $t('send') }}</div>
      <div v-if="tokenInValue > 0" class="text-gray-500">
        {{ fNum(tokenInValue, 'usd') }}
      </div>
    </div>
    <BalTextInput
      :name="'tokenIn'"
      :model-value="tokenInAmountInput"
      @input="value => handleInAmountChange(value)"
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
          <BalAsset
            v-if="tokenInAddressInput"
            :address="tokenInAddressInput"
            :size="28"
          />
          <div class="flex flex-col ml-3 w-14 leading-none truncate">
            <BalTooltip v-if="tokenInSymbol.length > 5">
              <template v-slot:activator>
                <span class="font-bold">
                  {{ tokenInSymbol }}
                </span>
              </template>
              <div>
                {{ tokenInSymbol }}
              </div>
            </BalTooltip>
            <span v-else class="font-bold">
              {{ tokenInSymbol }}
            </span>
          </div>
          <BalIcon :name="'chevron-down'" :size="'sm'" class="text-blue-500" />
        </div>
      </template>
      <template v-slot:info>
        <div class="cursor-pointer" @click="handleInMax">
          {{ $t('balance') }}: {{ fNum(tokenInBalance, 'token') }}
        </div>
      </template>
      <template v-slot:append>
        <div class="p-2">
          <BalBtn size="xs" color="white" @click="handleInMax">
            {{ $t('max') }}
          </BalBtn>
        </div>
      </template>
    </BalTextInput>
    <div class="flex items-center mb-4">
      <TradePairToggle @toggle="handleSwitchTokens" />
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
      :name="'tokenOut'"
      :model-value="tokenOutAmountInput"
      @input="value => handleOutAmountChange(value)"
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
          <BalAsset
            v-if="tokenOutAddressInput"
            :address="tokenOutAddressInput"
            :size="28"
          />
          <div class="flex flex-col ml-3 w-14 leading-none truncate">
            <BalTooltip v-if="tokenOutSymbol.length > 5">
              <template v-slot:activator>
                <span class="font-bold">
                  {{ tokenOutSymbol }}
                </span>
              </template>
              <div>
                {{ tokenOutSymbol }}
              </div>
            </BalTooltip>
            <span v-else class="font-bold">
              {{ tokenOutSymbol }}
            </span>
          </div>
          <BalIcon :name="'chevron-down'" :size="'sm'" class="text-blue-500" />
        </div>
      </template>
      <template v-slot:info>
        <div class="cursor-pointer" @click="handleOutMax">
          {{ $t('balance') }}: {{ fNum(tokenOutBalance, 'token') }}
        </div>
      </template>
      <template v-slot:append>
        <div class="p-2">
          <BalBtn size="xs" color="white" @click="handleOutMax">
            {{ $t('max') }}
          </BalBtn>
        </div>
      </template>
    </BalTextInput>
  </div>
  <teleport to="#modal">
    <SelectTokenModal
      v-if="modalSelectTokenIsOpen"
      :excludedTokens="[tokenInAddressInput, tokenOutAddressInput]"
      @close="modalSelectTokenIsOpen = false"
      @select="handleSelectToken"
      include-ether
    />
  </teleport>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed, ref, PropType } from 'vue';
import { useStore } from 'vuex';

import useNumbers from '@/composables/useNumbers';
import { ETHER } from '@/constants/tokenlists';

import TradePairToggle from '@/components/cards/TradeCard/TradePairToggle.vue';
import SelectTokenModal from '@/components/modals/SelectTokenModal/SelectTokenModal.vue';
import useTokens from '@/composables/useTokens';
import { UseTrading } from '@/composables/trade/useTrading';

const ETH_BUFFER = 0.1;

export default defineComponent({
  components: {
    TradePairToggle,
    SelectTokenModal
  },
  props: {
    tokenInAmountInput: {
      type: String,
      required: true
    },
    tokenInAddressInput: {
      type: String,
      required: true
    },
    tokenOutAmountInput: {
      type: String,
      required: true
    },
    tokenOutAddressInput: {
      type: String,
      required: true
    },
    exactIn: {
      type: Boolean,
      required: true
    },
    effectivePriceMessage: {
      type: Object as PropType<UseTrading['effectivePriceMessage']>,
      required: true
    }
  },
  emits: [
    'tokenInAddressChange',
    'tokenInAmountChange',
    'tokenOutAddressChange',
    'tokenOutAmountChange',
    'exactInChange',
    'change'
  ],
  setup(props, { emit }) {
    // COMPOSABLES
    const store = useStore();
    const { fNum, toFiat } = useNumbers();

    // DATA
    const {
      tokenInAmountInput,
      tokenInAddressInput,
      tokenOutAmountInput,
      tokenOutAddressInput,
      exactIn
    } = toRefs(props);

    const isInRate = ref(true);
    const modalSelectTokenType = ref('input');
    const modalSelectTokenIsOpen = ref(false);

    const { tokens } = useTokens();

    const tokenInValue = computed(() =>
      toFiat(tokenInAmountInput.value, tokenInAddressInput.value)
    );

    const tokenInSymbol = computed(() => {
      const tokenIn = tokens.value[tokenInAddressInput.value];
      const symbol = tokenIn ? tokenIn.symbol : '';
      return symbol;
    });

    const tokenOutValue = computed(() =>
      toFiat(tokenOutAmountInput.value, tokenOutAddressInput.value)
    );

    const tokenOutSymbol = computed(() => {
      const tokenOut = tokens.value[tokenOutAddressInput.value];
      const symbol = tokenOut ? tokenOut.symbol : '';
      return symbol;
    });

    const tokenInBalance = computed(
      () => tokens.value[tokenInAddressInput.value]?.balance || '0'
    );

    const tokenOutBalance = computed(
      () => tokens.value[tokenOutAddressInput.value]?.balance || '0'
    );

    // METHODS

    function getMaxAmount(
      tokenAddress: string,
      balance: string,
      balanceNumber: number
    ) {
      return tokenAddress !== ETHER.address
        ? balance
        : balanceNumber > ETH_BUFFER
        ? (balanceNumber - ETH_BUFFER).toString()
        : '0';
    }
    function handleInMax() {
      const balance = tokenInBalance.value;
      const balanceNumber = parseFloat(balance);
      const maxAmount = getMaxAmount(
        tokenInAddressInput.value,
        balance,
        balanceNumber
      );

      handleInAmountChange(maxAmount);
    }

    function handleOutMax() {
      const balance = tokenOutBalance.value;
      const balanceNumber = parseFloat(balance);
      const maxAmount = getMaxAmount(
        tokenOutAddressInput.value,
        balance,
        balanceNumber
      );
      handleOutAmountChange(maxAmount);
    }

    function handleInAmountChange(value: string): void {
      emit('exactInChange', true);
      emit('tokenInAmountChange', value);
      emit('change', value);
    }

    function handleOutAmountChange(value: string): void {
      emit('exactInChange', false);
      emit('tokenOutAmountChange', value);
      emit('change', value);
    }

    function handleSwitchTokens(): void {
      emit('exactInChange', !exactIn.value);
      emit('tokenInAmountChange', tokenOutAmountInput.value);
      emit('tokenInAddressChange', tokenOutAddressInput.value);
      emit('tokenOutAmountChange', tokenInAmountInput.value);
      emit('tokenOutAddressChange', tokenInAddressInput.value);
    }

    function handleSelectToken(address: string): void {
      if (modalSelectTokenType.value === 'input') {
        if (address === tokenOutAddressInput.value) {
          handleSwitchTokens();
          return;
        } else emit('tokenInAddressChange', address);
      } else {
        if (address === tokenInAddressInput.value) {
          handleSwitchTokens();
          return;
        } else emit('tokenOutAddressChange', address);
      }
      store.dispatch('registry/injectTokens', [address]);
    }

    const rateMessage = computed(() =>
      isInRate.value
        ? props.effectivePriceMessage.value.tokenIn
        : props.effectivePriceMessage.value.tokenOut
    );

    function toggleRate(): void {
      isInRate.value = !isInRate.value;
    }

    function openModalSelectToken(type: string): void {
      modalSelectTokenIsOpen.value = true;
      modalSelectTokenType.value = type;
    }

    return {
      tokens,
      fNum,
      handleInMax,
      handleOutMax,
      tokenInBalance,
      tokenOutBalance,
      handleInAmountChange,
      handleOutAmountChange,
      handleSwitchTokens,
      rateMessage,
      toggleRate,
      tokenInValue,
      tokenInSymbol,
      tokenOutValue,
      tokenOutSymbol,
      modalSelectTokenIsOpen,
      openModalSelectToken,
      handleSelectToken
    };
  }
});
</script>
