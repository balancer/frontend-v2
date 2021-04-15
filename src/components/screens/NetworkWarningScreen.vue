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
      <h1 class="font-body leading-snug text-gray-700">{{ warning }}</h1>
      <p v-if="networkMismatch">
        {{ $t('networkMismatchLink', [networkName]) }}
        <BalLink :href="networkLink">
          {{ networkLink }}
        </BalLink>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import useWeb3 from '@/composables/useWeb3';
import useEnv from '@/composables/useEnv';

export default defineComponent({
  name: 'NetworkWarningScreen',

  setup() {
    // COMPOSABLES
    const { t } = useI18n();
    const { appDomain } = useEnv();
    const {
      appNetworkName,
      networkName,
      unsupportedNetwork,
      networkMismatch
    } = useWeb3();

    // COMPUTED
    const warningLocaleKey = computed(() => {
      if (unsupportedNetwork.value) {
        return networkName.value
          ? 'unavailableOnNetworkWithName'
          : 'unavailableOnNetwork';
      } else if (networkMismatch.value) {
        return 'networkMismatch';
      } else {
        return '';
      }
    });

    const warning = computed(() => {
      return t(warningLocaleKey.value, [networkName.value, appNetworkName]);
    });

    const networkLink = computed(() => {
      const network = networkName.value.toLowerCase();
      const networkPrefix = network === 'mainnet' ? '' : `${network}.`;

      return `https://${networkPrefix}${appDomain}`;
    });

    return { warning, networkMismatch, networkLink, networkName };
  }
});
</script>
