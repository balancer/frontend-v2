<template>
  <div
    class="absolute right-4 top-2 float-right flex flex-col items-end hidden md:block"
  >
    <div
      v-if="tvl > 0 && beetsPrice > 0"
      class="text-green-500 font-semibold text-right"
    >
      TVL: ${{ fNum(tvl, 'usd_lg') }}
    </div>
    <div v-if="beetsPrice > 0" class="text-red-500 font-semibold text-right">
      BEETS: {{ fNum(beetsPrice, 'usd') }}
    </div>
    <div
      v-if="beetsPrice > 0 && marketCap > 0"
      class="font-semibold text-right"
    >
      Market Cap: ${{ fNum(marketCap, 'usd_lg') }}
    </div>
    <div
      v-if="beetsPrice > 0 && circulatingSupply > 0"
      class="font-semibold text-right"
    >
      Circulating: {{ fNum(circulatingSupply, 'token_lg') }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import useNumbers from '@/composables/useNumbers';
import useProtocolDataQuery from '@/beethovenx/composables/queries/useProtocolDataQuery';

export default defineComponent({
  name: 'GlobalStats',

  setup() {
    const protocolDataQuery = useProtocolDataQuery();
    const { fNum } = useNumbers();
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

    return {
      tvl,
      beetsPrice,
      circulatingSupply,
      marketCap,
      fNum
    };
  }
});
</script>
