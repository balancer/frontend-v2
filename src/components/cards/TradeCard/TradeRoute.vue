<script setup lang="ts">
import { SubgraphPoolBase, SwapV2 } from '@balancer-labs/sdk';
import { Network } from '@balancer-labs/sdk';
import { Pool } from '@balancer-labs/sor/dist/types';
import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import BigNumber from 'bignumber.js';
import { computed, ref } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { isSameAddress } from '@/lib/utils';
import { SorReturn } from '@/lib/utils/balancer/helpers/sor/sorManager';
import useWeb3 from '@/services/web3/useWeb3';

interface Props {
  addressIn: string;
  amountIn: string;
  addressOut: string;
  amountOut: string;
  pools: (Pool | SubgraphPoolBase)[];
  sorReturn: SorReturn;
}

interface Route {
  share: number;
  hops: Hop[];
}

interface Hop {
  pool: {
    address: string;
    id: string;
    tokens: Asset[];
  };
  tokenIn: string;
  tokenOut: string;
  amount: BigNumber;
}

interface Asset {
  address: string;
  share: number;
}

const props = defineProps<Props>();

const { fNum2 } = useNumbers();

const { appNetworkConfig } = useWeb3();
const { getToken } = useTokens();

const visible = ref(false);

function toggleVisibility(): void {
  visible.value = !visible.value;
}

const input = computed(() => {
  const symbol = getToken(props.addressIn).symbol;
  return {
    amount: props.amountIn,
    address: props.addressIn,
    symbol,
  };
});

const output = computed(() => {
  const symbol = getToken(props.addressOut).symbol;
  return {
    amount: props.amountOut,
    address: props.addressOut,
    symbol,
  };
});

const routes = computed<Route[]>((): Route[] => {
  const { sorReturn } = props;

  if (!sorReturn.hasSwaps) {
    return [];
  }

  const pools = props.pools as SubgraphPoolBase[];
  const swaps = sorReturn.result.swaps;
  const addresses = sorReturn.result.tokenAddresses;
  const addressIn = props.addressIn as string;
  const addressOut = props.addressOut as string;

  return getV2Routes(addressIn, addressOut, pools, swaps, addresses);
});
// TODO: Fix types
function getV2Routes(
  addressIn: string,
  addressOut: string,
  pools: SubgraphPoolBase[],
  swaps: SwapV2[],
  addresses: string[]
): Route[] {
  // ) {
  const { addresses: constants } = appNetworkConfig;

  addressIn =
    addressIn === NATIVE_ASSET_ADDRESS ? constants.weth : getAddress(addressIn);
  addressOut =
    addressOut === NATIVE_ASSET_ADDRESS
      ? constants.weth
      : getAddress(addressOut);

  if (
    !pools.length ||
    !swaps.length ||
    !addresses.length ||
    addresses.length === 1
  ) {
    return [];
  }

  // To get total amount we can use all swaps because multihops have a value of 0
  const totalSwapAmount = swaps.reduce((total, rawHops) => {
    return total.plus(rawHops.amount || '0');
  }, new BigNumber(0));

  // Contains direct and multihops
  const routes: Route[] = [];
  // Contains every token > token hop
  const allHops: Hop[] = [];
  for (let i = 0; i < swaps.length; i++) {
    const swap = swaps[i];
    const rawPool = pools.find(pool => pool.id === swap.poolId);

    if (rawPool) {
      const tokenIn =
        addresses[swap.assetInIndex] === AddressZero
          ? constants.weth
          : getAddress(addresses[swap.assetInIndex]);
      const tokenOut =
        addresses[swap.assetOutIndex] === AddressZero
          ? constants.weth
          : getAddress(addresses[swap.assetOutIndex]);

      const isDirectSwap =
        tokenIn === addressIn && tokenOut === addressOut ? true : false;

      const pool = {
        address: rawPool.address,
        id: rawPool.id,
        tokens: rawPool.tokens
          .map(token => {
            return {
              address: getAddress(token.address),
              share:
                parseFloat(token.weight || '') || 1 / rawPool.tokens.length,
            };
          })
          .sort((a, b) => {
            if (
              isSameAddress(a.address, tokenIn) ||
              isSameAddress(b.address, tokenOut)
            ) {
              return -1;
            }
            if (
              isSameAddress(a.address, tokenOut) ||
              isSameAddress(b.address, tokenIn)
            ) {
              return 1;
            }
            return a.share - b.share;
          })
          .filter((_token, index, tokens) => {
            // Show first 2 and last 2 tokens
            return index < 2 || index > tokens.length - 3;
          }),
      };

      const hop = {
        pool,
        tokenIn,
        tokenOut,
        amount: new BigNumber(swap.amount || '0'),
      };

      allHops.push(hop);

      if (isDirectSwap) {
        // Direct swaps are pushed to routes array immediately
        const share = hop.amount.div(totalSwapAmount).toNumber();
        const route = {
          share,
          hops: [hop],
        } as Route;
        routes.push(route);
      } else {
        // Only multihops that have a previous partner in sequence are pushed to routes
        if (tokenOut === addressOut && swap.amount === '0') {
          // TokenOut with amount of 0 for multihop means it's a swapExactIn and previous swap is partner of hop
          const swapAmount = new BigNumber(allHops[i - 1].amount);
          const share = swapAmount.div(totalSwapAmount).toNumber();
          const route = {
            share,
            hops: [allHops[i - 1], hop],
          } as Route;
          routes.push(route);
        } else if (tokenIn === addressIn && swap.amount === '0') {
          // TokenIn with amount of 0 for multihop means it's a swapExactOut and previous swap is partner of hop
          const swapAmount = new BigNumber(allHops[i - 1].amount);
          const share = swapAmount.div(totalSwapAmount).toNumber();
          const route = {
            share,
            hops: [hop, allHops[i - 1]],
          } as Route;
          routes.push(route);
        }
      }
    }
  }

  return routes;
}

function formatShare(share: number): string {
  return fNum2(share, FNumFormats.percent);
}

function getPoolLink(id: string): string {
  const chainId = appNetworkConfig.chainId;
  const prefixMap = {
    [Network.MAINNET]: 'app.',
    [Network.KOVAN]: 'kovan.',
    [Network.GOERLI]: 'goerli.',
    [Network.POLYGON]: 'polygon.',
    [Network.ARBITRUM]: 'arbitrum.',
  };
  const prefix = prefixMap[chainId] || '';

  return `https://${prefix}balancer.fi/#/pool/${id}`;
}
</script>

<template>
  <BalCard v-if="routes.length > 0" shadow="none">
    <div
      class="flex items-center cursor-pointer text-secondary"
      @click="toggleVisibility"
    >
      <div class="mr-2">
        {{ $t('tradeRoute') }}
      </div>
      <BalIcon v-if="visible" name="chevron-up" size="sm" />
      <BalIcon v-else name="chevron-down" size="sm" />
    </div>
    <div v-if="visible" class="mt-5">
      <div
        v-if="routes.length === 0"
        class="mt-5 text-sm text-secondary"
        v-text="$t('noData')"
      />
      <div v-else>
        <div>
          <div class="flex justify-between text-xs">
            <div>
              <div class="font-semibold">
                {{ input.amount }}
              </div>
              <div>
                {{ input.symbol }}
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="font-semibold">
                {{ output.amount }}
              </div>
              <div>
                {{ output.symbol }}
              </div>
            </div>
          </div>
          <div class="relative mt-2">
            <div
              class="absolute mx-9 h-1/2 border-b border-gray-500 border-dashed pair-line"
            />
            <div class="flex relative z-10 justify-between">
              <BalAsset :address="input.address" :size="36" />
              <BalAsset :address="output.address" :size="36" />
            </div>
          </div>
        </div>
        <div
          class="flex justify-between"
          :style="{ margin: `8px ${12 + routes.length}px` }"
        >
          <BalIcon
            name="triangle"
            size="xxs"
            :filled="true"
            class="transform rotate-180 text-secondary"
          />
          <BalIcon
            name="triangle"
            size="xxs"
            :filled="true"
            class="text-secondary"
          />
        </div>
        <div class="relative my-1.5 mx-4">
          <div
            v-for="(route, index) in routes"
            :key="index"
            :style="{
              height: `${18 + 70 * index}px`,
              width: `calc(100% - ${4 * (routes.length - index - 1)}px + 1px)`,
              margin: `0 ${2 * (routes.length - index - 1) - 1}px`,
            }"
            class="absolute rounded-b-md border-r border-b border-l border-gray-500"
          />
          <div class="relative z-10">
            <div
              v-for="route in routes"
              :key="route.hops[0]?.pool?.address"
              class="flex justify-between mt-9 first:mt-0"
            >
              <div class="flex items-center ml-4 w-4">
                <BalIcon
                  name="triangle"
                  size="xxs"
                  :filled="true"
                  class="transform rotate-90 text-secondary"
                />
              </div>
              <div class="flex">
                <div
                  v-for="hop in route.hops"
                  :key="hop?.pool?.address"
                  class="flex ml-4 first:ml-0 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-xl border border-gray-100 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-400 shadow transition-colors"
                >
                  <a
                    class="flex p-1.5"
                    :href="getPoolLink(hop.pool.id)"
                    target="_blank"
                  >
                    <BalAsset
                      v-for="token in hop.pool.tokens"
                      :key="token.address"
                      class="ml-1.5 first:ml-0"
                      :address="token.address"
                      :size="20"
                    />
                  </a>
                </div>
              </div>
              <div class="mr-4 w-10 text-xs text-right text-secondary">
                {{ formatShare(route.share) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BalCard>
</template>



<style scoped>
.pair-line {
  width: calc(100% - 72px);
}
</style>
