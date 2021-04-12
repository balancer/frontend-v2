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
      <h1 class="font-body leading-snug text-gray-700">
        {{
          t(
            web3.config.shortName
              ? 'unavailableOnNetworkWithName'
              : 'unavailableOnNetwork',
            [web3.config.shortName]
          )
        }}.
      </h1>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'UnsupportedNetworkScreen',

  setup() {
    const { t } = useI18n();

    return { t };
  }
});
</script>
