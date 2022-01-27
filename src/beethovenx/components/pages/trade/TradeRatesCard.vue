<template v-if="!loading">
  <BalCard shadow="lg" class="mt-8" noPad>
    <div class="flex items-center border-gray-700 border-b pt-3 px-4 pb-2">
      <div class="flex-1">
        <span class="font-medium">Live swap rates</span>
      </div>
      <div class="w-20 flex justify-center">
        <img
          src="https://assets.coingecko.com/coins/images/15223/small/logo_200x200.png"
          width="32"
        />
      </div>
      <div class="w-20 flex justify-center">
        <img
          src="https://storageapi.fleek.co/beethovenxfi-team-bucket/SPIRIT.png"
          width="32"
        />
      </div>
      <div class="w-20 flex justify-center">
        <img
          src="https://beethoven-assets.s3.eu-central-1.amazonaws.com/beets-icon-large.png"
          width="32"
        />
      </div>
    </div>
    <div
      v-for="(item, idx) in items"
      :key="item.id"
      :class="[
        'flex items-center border-gray-700 pt-2 px-3',
        idx === items.length - 1 ? 'pb-4' : 'pb-2 border-b'
      ]"
    >
      <div class="flex items-center flex-1">
        <BalAsset :address="item.tokenIn" :size="24" />
        <div class="ml-2 font-medium w-8">
          {{ item.amountInNumberFormatted }}
        </div>
        <BalIcon
          name="arrow-right"
          size="sm"
          class="ml-1 mr-2 flex items-center"
        />
        <BalAsset :address="item.tokenOut" :size="24" />
      </div>
      <div
        :class="[
          'w-20 flex justify-center',
          spooky[idx] > beets[idx] && spooky[idx] > spirit[idx]
            ? 'text-green-500'
            : ''
        ]"
      >
        {{
          spooky[idx] ? numeral(spooky[idx]).format(item.amountOutFormat) : ''
        }}
        <BalLoadingBlock v-if="!spooky[idx]" class="h-4 w-12 mx-auto" white />
      </div>
      <div
        :class="[
          'w-20 flex justify-center',
          spirit[idx] > spooky[idx] && spirit[idx] > beets[idx]
            ? 'text-green-500'
            : ''
        ]"
      >
        {{
          spirit[idx] ? numeral(spirit[idx]).format(item.amountOutFormat) : ''
        }}
        <BalLoadingBlock v-if="!spirit[idx]" class="h-4 w-12 mx-auto" white />
      </div>
      <div
        :class="[
          'w-20 flex justify-center',
          beets[idx] > spooky[idx] && beets[idx] > spirit[idx]
            ? 'text-green-500'
            : ''
        ]"
      >
        {{ beets[idx] ? numeral(beets[idx]).format(item.amountOutFormat) : '' }}
        <BalLoadingBlock v-if="!beets[idx]" class="h-4 w-12 mx-auto" white />
      </div>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import useNumbers from '@/composables/useNumbers';
import numeral from 'numeral';
import { SorManager } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { getAddress } from '@ethersproject/address';
import useDexesQuery from '@/beethovenx/composables/useDexesQuery';

const WFTM = getAddress('0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83');
const USDC = getAddress('0x04068DA6C83AFCFA0e13ba15A6696662335D5B75');
const BTC = getAddress('0x321162Cd933E2Be498Cd2267a90534A804051b11');
const ETH = getAddress('0x74b23882a30290451A17c44f4F05243b6b58C76d');
const DAI = getAddress('0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e');
const MIM = getAddress('0x82f0b8b456c1a451378467398982d4834b6829c1');
const SPIRIT = getAddress('0x5cc61a78f164885776aa610fb0fe1257df78e59b');
const SPELL = getAddress('0x468003b688943977e6130f4f68f23aad939a1040');
const FUSDT = getAddress('0x049d68029688eabf473097a2fc38ef61633a3c7a');

const SWAPS = [
  {
    id: '0',
    amountIn: '60000000000',
    spookyPath: [USDC, WFTM, BTC],
    spiritPath: [USDC, WFTM, BTC],
    tokenIn: USDC,
    tokenInDecimal: 6,
    tokenOut: BTC,
    tokenOutDecimal: 8,
    amountInNumber: 60000,
    amountInNumberFormatted: '60k',
    amountOutFormat: '0.0000'
  },
  {
    id: '1',
    amountIn: '5000000000000000000000',
    spookyPath: [WFTM, ETH],
    spiritPath: [WFTM, ETH],
    tokenIn: WFTM,
    tokenOut: ETH,
    tokenInDecimal: 18,
    tokenOutDecimal: 18,
    amountInNumber: 5000,
    amountInNumberFormatted: '5k',
    amountOutFormat: '0.[0000]'
  },
  {
    id: '2',
    amountIn: '10000000000',
    spookyPath: [USDC, WFTM, DAI],
    spiritPath: [USDC, DAI],
    tokenIn: USDC,
    tokenOut: DAI,
    tokenInDecimal: 6,
    tokenOutDecimal: 18,
    amountInNumber: 10000,
    amountInNumberFormatted: '10k',
    amountOutFormat: '0,0'
  },
  {
    id: '3',
    amountIn: '1000000000000000000000',
    spookyPath: [MIM, WFTM, SPELL],
    spiritPath: [MIM, WFTM, FUSDT, SPELL],
    tokenIn: MIM,
    tokenOut: SPELL,
    tokenInDecimal: 18,
    tokenOutDecimal: 18,
    amountInNumber: 1000,
    amountInNumberFormatted: '1k',
    amountOutFormat: '0,0'
  },
  {
    id: '4',
    amountIn: '100000000',
    spookyPath: [BTC, WFTM, USDC],
    spiritPath: [BTC, WFTM, USDC],
    tokenIn: BTC,
    tokenInDecimal: 8,
    tokenOut: USDC,
    tokenOutDecimal: 6,
    amountInNumber: 1,
    amountInNumberFormatted: '1.0',
    amountOutFormat: '0,0'
  },
  {
    id: '5',
    amountIn: '3000000000000000000',
    spookyPath: [ETH, WFTM],
    spiritPath: [ETH, WFTM],
    tokenIn: ETH,
    tokenOut: WFTM,
    tokenInDecimal: 18,
    tokenOutDecimal: 18,
    amountInNumber: 3,
    amountInNumberFormatted: '3.0',
    amountOutFormat: '0,0'
  },
  {
    id: '6',
    amountIn: '10000000000000000000000',
    spookyPath: [DAI, WFTM, USDC],
    spiritPath: [DAI, USDC],
    tokenIn: DAI,
    tokenOut: USDC,
    tokenInDecimal: 18,
    tokenOutDecimal: 6,
    amountInNumber: 10000,
    amountInNumberFormatted: '10k',
    amountOutFormat: '0,0'
  },
  {
    id: '7',
    amountIn: '50000000000000000000000',
    spookyPath: [SPELL, WFTM, MIM],
    spiritPath: [SPELL, FUSDT, WFTM, MIM],
    tokenIn: SPELL,
    tokenOut: MIM,
    tokenInDecimal: 18,
    tokenOutDecimal: 18,
    amountInNumber: 50000,
    amountInNumberFormatted: '50k',
    amountOutFormat: '0,0'
  }
];

export default defineComponent({
  components: {},

  props: {
    sorManager: {
      type: Object as PropType<SorManager>,
      required: true
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { isLoading, data, isIdle } = useDexesQuery(props.sorManager, SWAPS);

    setInterval(() => {
      toggle.value = !toggle.value;
    }, 7500);

    const toggle = ref(false);
    const spooky = computed(() => {
      if (!data.value?.spooky) {
        return [];
      }

      return toggle.value
        ? data.value.spooky.slice(0, 4)
        : data.value.spooky.slice(4, 8);
    });

    const spirit = computed(() => {
      if (!data.value?.spirit) {
        return [];
      }

      return toggle.value
        ? data.value.spirit.slice(0, 4)
        : data.value.spirit.slice(4, 8);
    });

    const beets = computed(() => {
      if (!data.value?.beets) {
        return [];
      }

      return toggle.value
        ? data.value.beets.slice(0, 4)
        : data.value.beets.slice(4, 8);
    });
    const loading = computed(() => isLoading.value || isIdle.value);

    const items = computed(() =>
      toggle.value ? SWAPS.slice(0, 4) : SWAPS.slice(4, 8)
    );

    return {
      // data
      items,
      spooky,
      spirit,
      beets,
      loading,

      // methods
      fNum,
      numeral,
      toggle
    };
  }
});
</script>
