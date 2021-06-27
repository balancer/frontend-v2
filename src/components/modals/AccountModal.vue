<template>
  <BalModal show :title="title" @close="$emit('close')">
    <div
      v-if="!account || step === 'connect'"
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
          {{ t('seeMore') }} ({{ invisibleConnectorsCount }})
        </div>
      </div>
    </div>
  </BalModal>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive, computed } from 'vue';
import connectorsList from '@/constants/connectors.json';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    open: { type: Boolean, default: false }
  },

  emits: ['close', 'login'],

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();

    // DATA
    const data = reactive({
      connectorsLimit: 3,
      step: null,
      path:
        'https://raw.githubusercontent.com/snapshot-labs/lock/master/connectors/assets'
    });

    // COMPUTED
    const account = computed(() => store.state.web3.account);

    const title = computed(() => {
      if (!account.value || data.step === 'connect') return t('connectWallet');
      return t('account');
    });

    const connectors = computed(() => {
      return Object.fromEntries(
        Object.entries(connectorsList).slice(0, data.connectorsLimit)
      );
    });

    const invisibleConnectorsCount = computed(() => {
      return (
        Object.keys(connectorsList).length -
        Object.keys(connectors.value).length
      );
    });

    return {
      // data
      ...toRefs(data),
      // computed
      account,
      title,
      connectors,
      invisibleConnectorsCount,
      // methods
      t
    };
  }
});
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
