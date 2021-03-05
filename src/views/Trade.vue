<template>
  <Layout>
    <div class="border p-10 max-w-lg mx-auto mt-16 rounded-2xl">
      <Icon
        :size="24"
        name="gear"
        class="rounded-full border p-1 inline-block float-right"
      />
      <h2 class="mb-6">Swap</h2>
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
        <a @click="handleSwitchAssets" class="inline-block mb-4">
          <Icon
            :size="24"
            name="refresh"
            class="rounded-full border p-2 inline-block"
          />
        </a>
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
              type="number"
              placeholder="0"
              class="w-full"
            />
          </div>
        </div>
      </div>
      <UiButton class="w-full">Swap</UiButton>
    </div>
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
import { ref, defineComponent, computed, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
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
    const q = ref('');

    const tokens = computed(() => getTokens());

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
    }

    function handleSwitchAssets(): void {
      const assetInAddressInputSave = assetInAddressInput.value;
      const assetInAmountInputSave = assetInAmountInput.value;
      assetInAddressInput.value = assetOutAddressInput.value;
      assetOutAddressInput.value = assetInAddressInputSave;
      assetInAmountInput.value = assetOutAmountInput.value;
      assetOutAmountInput.value = assetInAmountInputSave;
    }

    watch(chainId, () => {
      assetInAddressInput.value = '';
      assetInAmountInput.value = '';
      assetOutAddressInput.value = '';
      assetOutAmountInput.value = '';
    });

    return {
      chainId,
      assetInAddressInput,
      assetInAmountInput,
      assetOutAddressInput,
      assetOutAmountInput,
      modalSelectTokenIsOpen,
      modalSelectListIsOpen,
      openModalSelectToken,
      openModalSelectList,
      handleSelectToken,
      handleTokenSearch,
      handleToggleList,
      handleMax,
      handleSwitchAssets,
      q,
      tokens,
      getTokens,
      getTokenlists
    };
  }
});
</script>
