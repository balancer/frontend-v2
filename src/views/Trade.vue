<template>
  <Layout>
    <BalCard class="p-8 max-w-lg mx-auto mt-16">
      <h2 v-text="$t('trade')" class="mb-6" />
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
            <span v-else>Select</span>
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
              <a @click="handleMax" class="p-1 border rounded text-xs">
                Max
              </a>
            </div>
            <div v-if="tokenInAddressInput" class="text-xs">
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
            <span v-else>Select</span>
          </a>
          <div class="col-span-8 px-3 py-2">
            <input
              v-model="tokenOutAmountInput"
              @input="handleAmountChange(false, $event.target.value)"
              type="number"
              placeholder="0"
              class="w-full"
            />
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
        v-else-if="requireAllowance"
        label="Allow"
        :loading="approving"
        loading-label="Allowing..."
        block
        @click.prevent="approve"
      />
      <BalBtn
        v-else
        type="submit"
        label="Swap"
        loading-label="Confirming..."
        color="gradient"
        block
      />
    </BalCard>
    <teleport to="#modal">
      <ModalSelectToken
        :open="modalSelectTokenIsOpen"
        :loading="registry.loading"
        @close="modalSelectTokenIsOpen = false"
        @select="handleSelectToken"
        @selectTokenlist="openModalSelectList"
        @inputSearch="handleTokenSearch"
        :tokens="
          getTokens({ q, not: [tokenInAddressInput, tokenOutAddressInput] })
        "
        :tokenlists="getTokenlists({ active: true })"
      />
      <ModalSelectTokenlist
        :open="modalSelectListIsOpen"
        @close="modalSelectListIsOpen = false"
        @back="openModalSelectToken"
        @select="handleToggleList($event)"
        @inputSearch="q = $event"
        :tokenlists="getTokenlists({ q })"
      />
    </teleport>
  </Layout>
</template>

<script lang="ts">
import { ref, defineComponent, computed, watch, onMounted } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { useStore } from 'vuex';
import numeral from 'numeral';
import { SOR } from '@balancer-labs/sor';
import { BigNumber } from 'bignumber.js';
import getProvider from '@/utils/provider';
import { Pool } from '@balancer-labs/sor/dist/types';
import { scale } from '@/utils';
import useAuth from '@/composables/useAuth';
import useTokenApproval from '@/composables/trade/useTokenApproval';
import useValidation from '@/composables/trade/useValidation';

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = 4;

export default defineComponent({
  setup() {
    let sor: SOR | undefined = undefined;

    const store = useStore();
    const auth = useAuth();

    const { getTokens, getTokenlists } = store.getters;
    const { config } = store.state.web3;

    const chainId = computed(() => config.chainId);
    const tokenInAddressInput = ref('');
    const tokenInAmountInput = ref('');
    const tokenOutAddressInput = ref('');
    const tokenOutAmountInput = ref('');
    const modalSelectTokenType = ref('input');
    const modalSelectTokenIsOpen = ref(false);
    const modalSelectListIsOpen = ref(false);
    const isInRate = ref(true);
    const q = ref('');
    const pools = ref<Pool[]>([]);

    const tokens = computed(() => getTokens());

    // Composables
    const { approving, approve, requireAllowance } = useTokenApproval(
      tokenInAddressInput,
      tokenInAmountInput,
      tokens
    );
    const { errorMessage } = useValidation(
      tokenInAddressInput,
      tokenInAmountInput,
      tokenOutAddressInput,
      tokenOutAmountInput,
      tokens
    );

    onMounted(async () => await initSor());

    useIntervalFn(async () => {
      if (sor) {
        console.time('[SOR] fetchPools');
        await sor.fetchPools();
        console.timeEnd('[SOR] fetchPools');
      }
    }, 60 * 1e3);

    async function handleAmountChange(
      isExactIn: boolean,
      amount: string
    ): Promise<void> {
      const tokenInAddress = tokenInAddressInput.value;
      const tokenOutAddress = tokenOutAddressInput.value;

      if (
        !tokenInAddress ||
        !tokenOutAddress ||
        !sor ||
        !sor.hasDataForPair(tokenInAddress, tokenOutAddress)
      ) {
        return;
      }

      const tokenInDecimals = tokens.value[tokenInAddress].decimals;
      const tokenOutDecimals = tokens.value[tokenOutAddress].decimals;

      const tokenAmountRaw = new BigNumber(amount);

      if (isExactIn) {
        const tokenInAmount = scale(tokenAmountRaw, tokenInDecimals);

        console.time(
          `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactIn`
        );
        const [, tradeAmount] = await sor.getSwaps(
          tokenInAddress,
          tokenOutAddress,
          'swapExactIn',
          tokenInAmount
        );
        console.timeEnd(
          `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactIn`
        );

        const tokenOutAmountRaw = scale(tradeAmount, -tokenOutDecimals);
        tokenOutAmountInput.value = tokenOutAmountRaw.toFixed(
          6,
          BigNumber.ROUND_DOWN
        );
      } else {
        const tokenOutAmount = scale(tokenAmountRaw, tokenOutDecimals);

        console.time(
          `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactOut`
        );

        const [, tradeAmount] = await sor.getSwaps(
          tokenInAddress,
          tokenOutAddress,
          'swapExactOut',
          tokenOutAmount
        );
        console.timeEnd(
          `[SOR] getSwaps ${tokenInAddress} ${tokenOutAddress} exactOut`
        );

        const tokenInAmountRaw = scale(tradeAmount, -tokenInDecimals);
        tokenInAmountInput.value = tokenInAmountRaw.toFixed(
          6,
          BigNumber.ROUND_DOWN
        );
      }
    }

    const rateMessage = computed(() => {
      let message = '';
      if (
        tokenInAddressInput.value &&
        tokenOutAddressInput.value &&
        tokenInAmountInput.value &&
        tokenOutAmountInput.value
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

    async function initSor(): Promise<void> {
      const poolsUrl = `${config.subgraphBackupUrl}?timestamp=${Date.now()}`;
      sor = new SOR(
        getProvider(chainId.value),
        new BigNumber(GAS_PRICE),
        MAX_POOLS,
        chainId.value,
        poolsUrl
      );
      console.time('[SOR] fetchPools');
      await sor.fetchPools();
      console.timeEnd('[SOR] fetchPools');
      pools.value = sor.onChainCache.pools;
    }

    function openModalSelectToken(type: string): void {
      modalSelectTokenIsOpen.value = true;
      modalSelectListIsOpen.value = false;
      modalSelectTokenType.value = type;
      q.value = '';
    }

    function openModalSelectList(): void {
      modalSelectListIsOpen.value = true;
      modalSelectTokenIsOpen.value = false;
      q.value = '';
    }

    function connectWallet() {
      store.commit('setAccountModal', true);
    }

    function handleSelectToken(address: string): void {
      if (modalSelectTokenType.value === 'input') {
        tokenInAddressInput.value = address;
        handleAmountChange(false, tokenOutAmountInput.value);
      } else {
        tokenOutAddressInput.value = address;
        handleAmountChange(true, tokenInAmountInput.value);
      }
      store.dispatch('injectTokens', [address]);
    }

    function handleTokenSearch(address: string): void {
      q.value = address;
      store.dispatch('injectTokens', [address.trim()]);
    }

    function handleToggleList(name: string): void {
      store.dispatch('toggleList', name);
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

    watch(chainId, async () => {
      tokenInAddressInput.value = '';
      tokenInAmountInput.value = '';
      tokenOutAddressInput.value = '';
      tokenOutAmountInput.value = '';
      await initSor();
    });

    return {
      q,
      tokens,
      modalSelectTokenIsOpen,
      modalSelectListIsOpen,
      isAuthenticated: auth.isAuthenticated,
      connectWallet,
      tokenInAddressInput,
      tokenInAmountInput,
      tokenOutAddressInput,
      tokenOutAmountInput,
      rateMessage,
      openModalSelectToken,
      openModalSelectList,
      getTokens,
      getTokenlists,
      handleSelectToken,
      handleTokenSearch,
      handleToggleList,
      handleMax,
      handleSwitchTokens,
      handleAmountChange,
      toggleRate,
      errorMessage,
      requireAllowance,
      approving,
      approve
    };
  }
});
</script>
