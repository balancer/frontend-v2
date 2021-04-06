<template>
  <BalModal :show="open" :title="title" @close="$emit('close')">
    <div
      v-if="!web3.account || step === 'connect'"
      class="text-gray-700 font-medium"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(connector, id, i) in connectors"
          :key="i"
          class="account-btn"
          @click="$emit('login', connector.id)"
        >
          <template v-if="id !== 'injected'">
            <img
              :src="`${path}/${connector.id}.png`"
              height="28"
              width="28"
              class="account-btn-img"
            />
            {{ connector.name }}
          </template>
          <template v-else-if="injected">
            <img
              :src="`${path}/${injected.id}.png`"
              height="28"
              width="28"
              class="account-btn-img"
            />
            {{ injected.name }}
          </template>
        </div>
        <div
          v-if="invisibleConnectorsCount"
          class="account-btn"
          @click="connectorsLimit = 1e3"
        >
          {{ $t('seeMore') }} ({{ invisibleConnectorsCount }})
        </div>
      </div>
    </div>
  </BalModal>
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
    },

    title() {
      if (!this.web3.account || this.step === 'connect')
        return this.$t('connectWallet');
      return this.$t('account');
    }
  }
};
</script>

<style>
.account-btn {
  @apply rounded cursor-pointer;
  @apply bg-gray-100 hover:bg-gray-200;
  @apply flex flex-row md:flex-col items-center justify-center;
  @apply py-4 md:py-12;
}

.account-btn-img {
  @apply mr-4 md:mr-0 mb-0 md:mb-4;
}
</style>
