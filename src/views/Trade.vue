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
            <span v-if="assetInAddressInput">
              <Token
                :token="tokens[assetInAddressInput]"
                :size="32"
                :symbol="true"
              />
            </span>
            <span v-else>Select</span>
          </a>
          <div class="col-span-8 px-3 py-2">
            <div class="flex">
              <input
                v-model="assetInAmountInput"
                @input="handleAmountChange(true, $event.target.value)"
                type="number"
                placeholder="0"
                class="flex-auto"
              />
              <a @click="handleMax" class="p-1 border rounded text-xs">
                Max
              </a>
            </div>
            <div v-if="assetInAddressInput" class="text-xs">
              Balance:
              {{
                _num(tokens[assetInAddressInput]?.balance || 0, '0,0.[000000]')
              }}
            </div>
          </div>
        </div>
        <div class="flex mb-4">
          <a @click="handleSwitchAssets">
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
            <span v-if="assetOutAddressInput">
              <Token
                :token="tokens[assetOutAddressInput]"
                :size="32"
                :symbol="true"
              />
            </span>
            <span v-else>Select</span>
          </a>
          <div class="col-span-8 px-3 py-2">
            <input
              v-model="assetOutAmountInput"
              @input="handleAmountChange(false, $event.target.value)"
              type="number"
              placeholder="0"
              class="w-full"
            />
          </div>
        </div>
      </div>
      <UiButton class="w-full">Swap</UiButton>
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
          getTokens({ q, not: [assetInAddressInput, assetOutAddressInput] })
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
import { SOR } from '@balancer-labs/sor';
import numeral from 'numeral';
import { BigNumber } from 'bignumber.js';
import getProvider from '@/utils/provider';
import { Pool } from '@balancer-labs/sor/dist/types';
import { scale } from '@/utils';

const GAS_PRICE = process.env.VUE_APP_GAS_PRICE || '100000000000';
const MAX_POOLS = 4;

export default defineComponent({
  setup() {
    let sor: SOR | undefined = undefined;

    const store = useStore();
    const { getTokens, getTokenlists } = store.getters;

    const chainId = computed(() => store.state.web3.config.chainId);
    const assetInAddressInput = ref('');
    const assetInAmountInput = ref('');
    const assetOutAddressInput = ref('');
    const assetOutAmountInput = ref('');
    const modalSelectTokenType = ref('input');
    const modalSelectTokenIsOpen = ref(false);
    const modalSelectListIsOpen = ref(false);
    const isInRate = ref(true);
    const q = ref('');
    const pools = ref<Pool[]>([]);

    const tokens = computed(() => getTokens());

    onMounted(async () => {
      await initSor();
    });

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
      const assetInAddress = assetInAddressInput.value;
      const assetOutAddress = assetOutAddressInput.value;

      if (
        !assetInAddress ||
        !assetOutAddress ||
        !sor ||
        !sor.hasDataForPair(assetInAddress, assetOutAddress)
      ) {
        return;
      }

      const assetInDecimals = tokens.value[assetInAddress].decimals;
      const assetOutDecimals = tokens.value[assetOutAddress].decimals;

      const assetAmountRaw = new BigNumber(amount);

      if (isExactIn) {
        const assetInAmount = scale(assetAmountRaw, assetInDecimals);

        console.time(
          `[SOR] getSwaps ${assetInAddress} ${assetOutAddress} exactIn`
        );
        const [, tradeAmount] = await sor.getSwaps(
          assetInAddress,
          assetOutAddress,
          'swapExactIn',
          assetInAmount
        );
        console.timeEnd(
          `[SOR] getSwaps ${assetInAddress} ${assetOutAddress} exactIn`
        );

        const assetOutAmountRaw = scale(tradeAmount, -assetOutDecimals);
        assetOutAmountInput.value = assetOutAmountRaw.toFixed(
          6,
          BigNumber.ROUND_DOWN
        );
      } else {
        const assetOutAmount = scale(assetAmountRaw, assetOutDecimals);

        console.time(
          `[SOR] getSwaps ${assetInAddress} ${assetOutAddress} exactOut`
        );

        const [, tradeAmount] = await sor.getSwaps(
          assetInAddress,
          assetOutAddress,
          'swapExactOut',
          assetOutAmount
        );
        console.timeEnd(
          `[SOR] getSwaps ${assetInAddress} ${assetOutAddress} exactOut`
        );

        const assetInAmountRaw = scale(tradeAmount, -assetInDecimals);
        assetInAmountInput.value = assetInAmountRaw.toFixed(
          6,
          BigNumber.ROUND_DOWN
        );
      }
    }

    const rateMessage = computed(() => {
      let message = '';
      if (
        assetInAddressInput.value &&
        assetOutAddressInput.value &&
        assetInAmountInput.value &&
        assetOutAmountInput.value
      ) {
        const assetIn = tokens.value[assetInAddressInput.value];
        const assetOut = tokens.value[assetOutAddressInput.value];
        const assetInAmount = assetInAmountInput.value;
        const assetOutAmount = assetOutAmountInput.value;
        if (isInRate.value) {
          const rate = parseFloat(assetOutAmount) / parseFloat(assetInAmount);
          message = `1 ${assetIn.symbol} = ${numeral(rate).format(
            '0,0.[000000]'
          )} ${assetOut.symbol}`;
        } else {
          const rate = parseFloat(assetInAmount) / parseFloat(assetOutAmount);
          message = `1 ${assetOut.symbol} = ${numeral(rate).format(
            '0,0.[000000]'
          )} ${assetIn.symbol}`;
        }
      }
      return message;
    });

    function toggleRate(): void {
      isInRate.value = !isInRate.value;
    }

    async function initSor(): Promise<void> {
      const poolsUrl = `${
        store.state.web3.config.subgraphBackupUrl
      }?timestamp=${Date.now()}`;
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

    function handleSelectToken(address: string): void {
      if (modalSelectTokenType.value === 'input') {
        assetInAddressInput.value = address;
      } else {
        assetOutAddressInput.value = address;
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
      assetInAmountInput.value =
        tokens.value[assetInAddressInput.value]?.balance || '';
      handleAmountChange(true, assetInAmountInput.value);
    }

    function handleSwitchAssets(): void {
      const assetInAddressInputSave = assetInAddressInput.value;
      const assetInAmountInputSave = assetInAmountInput.value;
      assetInAddressInput.value = assetOutAddressInput.value;
      assetOutAddressInput.value = assetInAddressInputSave;
      assetInAmountInput.value = assetOutAmountInput.value;
      assetOutAmountInput.value = assetInAmountInputSave;
      handleAmountChange(false, assetOutAmountInput.value);
    }

    watch(chainId, async () => {
      assetInAddressInput.value = '';
      assetInAmountInput.value = '';
      assetOutAddressInput.value = '';
      assetOutAmountInput.value = '';
      await initSor();
    });

    return {
      q,
      tokens,
      modalSelectTokenIsOpen,
      modalSelectListIsOpen,

      assetInAddressInput,
      assetInAmountInput,
      assetOutAddressInput,
      assetOutAmountInput,
      rateMessage,

      openModalSelectToken,
      openModalSelectList,
      getTokens,
      getTokenlists,

      handleSelectToken,
      handleTokenSearch,
      handleToggleList,
      handleMax,
      handleSwitchAssets,
      handleAmountChange,
      toggleRate
    };
  }
});
</script>
