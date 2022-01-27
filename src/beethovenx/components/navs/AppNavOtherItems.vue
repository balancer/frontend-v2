<template>
  <BalPopover no-pad align="left">
    <template v-slot:activator>
      <div
        class="flex items-center px-4 cursor-pointer relative"
        style="top: -10px"
      >
        <div class="text-4xl">...</div>
      </div>
    </template>
    <div class="w-48">
      <a class="app-nav-other-item" href="https://snapshot.org/#/beets.eth"
        >Vote</a
      >
      <a class="app-nav-other-item" href="https://info.beets.fi">Analytics</a>
      <a class="app-nav-other-item" href="https://docs.beethovenx.io">
        Docs & Help
      </a>
      <a class="app-nav-other-item" href="https://github.com/beethovenxfi">
        Github
      </a>
      <a class="app-nav-other-item" href="https://twitter.com/beethoven_x">
        Twitter
      </a>
      <a class="app-nav-other-item" href="https://beethovenxio.medium.com/">
        Medium
      </a>
      <a class="app-nav-other-item" href="https://discord.gg/jedS4zGk28">
        Discord
      </a>
      <a class="app-nav-other-item" href="https://app.multichain.org/#/router">
        Multichain Bridge
        <div class="text-xs text-gray-400">
          ETH / AVAX / BSC / MATIC
        </div>
      </a>
      <a
        class="app-nav-other-item"
        href="https://app.allbridge.io/bridge?from=SOL&to=FTM&asset=SOL"
      >
        AllBridge
        <div class="text-xs text-gray-400">SOL / MATIC / CELO</div>
      </a>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';
import { Alert } from '@/composables/useAlerts';
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';

export default defineComponent({
  name: 'AppNavOtherItems',

  props: {
    alert: { type: Object as PropType<Alert>, required: true }
  },

  setup() {
    const { fNum } = useNumbers();
    const { upToLargeBreakpoint } = useBreakpoints();

    const protocolDataQuery = useProtocolDataQuery();
    const tvl = computed(
      () => protocolDataQuery.data?.value?.totalLiquidity || 0
    );

    const beetsPrice = computed(
      () => protocolDataQuery.data?.value?.beetsPrice || 0
    );
    const circulatingSupply = computed(
      () => protocolDataQuery.data.value?.circulatingSupply || 0
    );
    const marketCap = computed(() => {
      return beetsPrice.value * circulatingSupply.value;
    });
    const loading = computed(() => protocolDataQuery.isLoading.value);

    return {
      fNum,
      upToLargeBreakpoint,
      beetsPrice,
      tvl,
      circulatingSupply,
      marketCap,
      loading
    };
  }
});
</script>

<style scoped>
.app-nav-other-item {
  @apply px-4 py-2 text-gray-300 hover:text-green-500 block hover:bg-gray-700;
}
</style>
