<template>
  <div
    class="absolute top-0 left-0 h-screen w-full flex flex-col items-center justify-center bg-gray-50 z-50"
  >
    <BalIcon
      name="alert-triangle"
      size="xl"
      class="text-red-500 mx-auto mb-8"
    />
    <div class="px-8 text-center">
      <h1 class="font-body leading-snug text-gray-700">{{ warning }}.</h1>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'UnsupportedNetworkScreen',

  setup() {
    // COMPOSABLES
    const { t } = useI18n();
    const store = useStore();

    // COMPUTED
    const networkName = computed(() => store.state.web3.config.shortName);
    const warning = computed(() => {
      const key = networkName.value
        ? 'unavailableOnNetworkWithName'
        : 'unavailableOnNetwork';
      return t(key, [networkName]);
    });

    return { warning };
  }
});
</script>
