<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3
        v-if="!web3.account || step === 'connect'"
        v-text="$t('connectWallet')"
      />
      <h3 v-else v-text="$t('account')" />
    </template>
    <div v-if="!web3.account || step === 'connect'">
      <div class="m-4 mb-5">
        <a
          v-for="(connector, id, i) in connectors"
          :key="i"
          @click="$emit('login', connector.id)"
          target="_blank"
          class="mb-2 block"
        >
          <UiButton
            v-if="id !== 'injected'"
            class="button-outline w-full align-middle"
          >
            <img
              :src="`${path}/${connector.id}.png`"
              height="28"
              width="28"
              class="mr-1 inline-block align-middle"
            />
            {{ connector.name }}
          </UiButton>
          <UiButton
            v-else-if="injected"
            class="button-outline w-full align-middle"
          >
            <img
              :src="`${path}/${injected.id}.png`"
              height="28"
              width="28"
              class="mr-1 inline-block align-middle"
            />
            {{ injected.name }}
          </UiButton>
        </a>
        <UiButton
          @click="connectorsLimit = 1e3"
          v-if="invisibleConnectorsCount"
          class="w-full"
        >
          {{ $t('seeMore') }} ({{ invisibleConnectorsCount }})
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script>
import { getInjected } from '@snapshot-labs/lock/src/utils';
import connectors from '@/constants/connectors.json';

export default {
  props: ['open'],
  emits: ['close'],
  data() {
    return {
      connectorsLimit: 3,
      step: null,
      path:
        'https://raw.githubusercontent.com/snapshot-labs/lock/master/connectors/assets'
    };
  },
  watch: {
    open() {
      this.step = null;
      this.connectorsLimit = 3;
    }
  },
  computed: {
    injected() {
      return getInjected();
    },
    connectors() {
      return Object.fromEntries(
        Object.entries(connectors).slice(0, this.connectorsLimit)
      );
    },
    invisibleConnectorsCount() {
      return (
        Object.keys(connectors).length - Object.keys(this.connectors).length
      );
    }
  }
};
</script>
