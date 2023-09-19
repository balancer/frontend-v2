<script lang="ts" setup>
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useGraphQuery from '@/composables/queries/useGraphQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import { networkId } from '@/composables/useNetwork';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import TokenService from '@/services/token/token.service';
import useWeb3 from '@/services/web3/useWeb3';
import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import { getAddress } from '@ethersproject/address';
import { useQuery } from '@tanstack/vue-query';
import TokensWhite from '@/assets/images/icons/tokens_white.svg';
import TokensBlack from '@/assets/images/icons/tokens_black.svg';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import TxActionBtn from '@/components/btns/TxActionBtn/TxActionBtn.vue';
import { keyBy, merge, pickBy } from 'lodash';
import {
  CSP_ISSUE_POOL_IDS,
  isHighRisk,
} from '@/constants/pool-lists/csp-issue';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { Interface } from '@ethersproject/abi';
import { parseUnits } from '@ethersproject/units';

const tokenService = new TokenService();

const balancerChildChainGaugeABi = [
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: '_value', type: 'uint256' }],
    outputs: [],
  },
];

const auraBaseRewardPool4626Abi = [
  {
    inputs: [{ internalType: 'bool', name: 'claim', type: 'bool' }],
    name: 'withdrawAllAndUnwrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

/**
 * TYPES
 */
type LiquidityGaugesQueryResponse = {
  liquidityGauges: {
    id: string;
    symbol: string;
    poolId: string;
    poolAddress: string;
  }[];
};

type AuraGaugesQueryResponse = {
  pools: {
    id: string;
    poolId: string;
    address: string;
    name: string;
    lpToken: {
      address: string;
    };
  }[];
};

/**
 * PROPS & EMITS
 */
const emit = defineEmits(['unstaked']);

/**
 * COMPOSABLES
 */
const { account, explorerLinks, getSigner } = useWeb3();
const { fNum } = useNumbers();
const { upToLargeBreakpoint } = useBreakpoints();
const { darkMode } = useDarkMode();

const poolIds = computed((): string[] => CSP_ISSUE_POOL_IDS[networkId.value]);
const poolAddresses = computed(() => poolIds.value.map(id => id.slice(0, 42)));
const addressToPoolIdMap = computed(
  () => new Map(poolIds.value.map(id => [id.slice(0, 42), id]))
);

const enableBalanceFetching = computed(() => !!account.value);

const liquidityGaugesQuery = useGraphQuery<LiquidityGaugesQueryResponse>(
  configService.network.subgraphs.gauge,
  ['vulnerability', 'liquidityGauges', 'unstake', { networkId }],
  () => ({
    liquidityGauges: {
      __args: { first: 1000, where: { poolId_in: poolIds.value } },
      id: true,
      symbol: true,
      poolId: true,
      poolAddress: true,
    },
  }),
  {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  }
);

const auraGaugesQuery = useGraphQuery<AuraGaugesQueryResponse>(
  'https://data.aura.finance/graphql',
  ['vulnerability', 'auraGauges', 'unstake', { networkId }],
  () => ({
    pools: {
      __args: { chainId: networkId.value },
      id: true,
      poolId: true,
      address: true,
      name: true,
      lpToken: {
        address: true,
      },
    },
  }),
  {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  }
);

const allLiquidityGauges = computed(
  () => liquidityGaugesQuery.data.value?.liquidityGauges ?? []
);
const allLiquidityGaugesAsTokenInfoMap = computed((): TokenInfoMap => {
  const tokens = allLiquidityGauges.value.map(gauge => ({
    chainId: networkId.value,
    address: gauge.id,
    decimals: 18,
    symbol: gauge.symbol,
    name: gauge.symbol,
    tags: ['balancer'],
  }));

  return keyBy(tokens, 'address');
});

const allAuraGauges = computed(() =>
  (auraGaugesQuery.data.value?.pools ?? []).filter(pool =>
    poolAddresses.value.includes(pool.lpToken.address)
  )
);
const allAuraGaugesAsTokenInfoMap = computed((): TokenInfoMap => {
  const tokens = allAuraGauges.value.map(gauge => ({
    chainId: networkId.value,
    address: gauge.address,
    decimals: 18,
    symbol: gauge.name,
    name: gauge.name,
    tags: ['aura'],
  }));

  return keyBy(tokens, 'address');
});

const allGaugesAsTokenInfoMap = computed(
  (): TokenInfoMap =>
    merge(
      allAuraGaugesAsTokenInfoMap.value,
      allLiquidityGaugesAsTokenInfoMap.value
    )
);

const enableBalancesQuery = computed(
  () =>
    enableBalanceFetching.value &&
    (allLiquidityGauges.value.length > 0 || allAuraGauges.value.length > 0)
);

// Fetch user balances for all gauges.
const balancesQuery = useQuery(
  [
    'vulnerability',
    'unstake',
    'balances',
    { networkId, allLiquidityGauges, allAuraGauges },
  ],
  async () =>
    tokenService.balances.get(account.value, allGaugesAsTokenInfoMap.value),
  { enabled: enableBalancesQuery }
);

const balances = computed(() => balancesQuery.data.value || {});

const isLoading = computed(
  (): boolean =>
    isQueryLoading(liquidityGaugesQuery) || isQueryLoading(balancesQuery)
);

const tokensWithBalance = computed(
  (): TokenInfoMap =>
    pickBy(allGaugesAsTokenInfoMap.value, token =>
      bnum(balancerFor(token.address)).gt(0)
    )
);

// The list of tokens to display in the table.
const tokensList = computed(() => Object.values(tokensWithBalance.value));

/**
 * METHODS
 */
async function unstake(token: TokenInfo) {
  const isAuraGauge = token.tags?.includes('aura');

  if (isAuraGauge) {
    return unstakeFromAuraGauge(token);
  } else {
    return unstakeFromBalancerChildGauge(token);
  }
}

async function unstakeFromAuraGauge(token: TokenInfo) {
  const signer = getSigner();
  const txBuilder = new TransactionBuilder(signer);
  const gaugeInterface = new Interface(auraBaseRewardPool4626Abi);

  return txBuilder.raw.sendTransaction({
    to: token.address,
    data: gaugeInterface.encodeFunctionData('withdrawAllAndUnwrap', [true]),
  });
}

async function unstakeFromBalancerChildGauge(token: TokenInfo) {
  const signer = getSigner();
  const txBuilder = new TransactionBuilder(signer);
  const gaugeInterface = new Interface(balancerChildChainGaugeABi);
  const balance = parseUnits(balancerFor(token.address), token.decimals);

  return txBuilder.raw.sendTransaction({
    to: token.address,
    data: gaugeInterface.encodeFunctionData('withdraw', [balance]),
  });
}

function balancerFor(address: string): string {
  return balances.value[getAddress(address)];
}

function handleRowClick(token: TokenInfo) {
  window.open(explorerLinks.addressLink(token.address));
}

function unstakeDisabled(token): boolean {
  return bnum(balancerFor(token.address)).lte(0);
}

function refetchBalances() {
  balancesQuery.refetch();
  emit('unstaked');
}

function poolIdFor(token: TokenInfo): string {
  const liquidityGauge = allLiquidityGauges.value.find(
    gauge => gauge.id.toLowerCase() === token.address.toLowerCase()
  );
  if (liquidityGauge) return liquidityGauge.poolId;

  const auraGauge = allAuraGauges.value.find(
    gauge => gauge.address.toLowerCase() === token.address.toLowerCase()
  );
  if (auraGauge)
    return addressToPoolIdMap.value.get(auraGauge.lpToken.address) || '';

  return '';
}

/**
 * TABLE DEFINITION
 */
const columns = ref<ColumnDefinition<TokenInfo>[]>([
  {
    name: 'Icons',
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 100,
    noGrow: true,
  },
  {
    name: 'Gauge',
    id: 'token',
    width: 350,
    className: 'px-0',
    accessor: token =>
      `${token.symbol} (${token.tags?.includes('aura') ? 'Aura' : 'Balancer'})`,
  },
  {
    name: 'Risk',
    id: 'risk',
    width: 150,
    align: 'right',
    noGrow: true,
    accessor: 'risk',
    Cell: 'riskCell',
  },
  {
    name: 'Balance',
    id: 'balance',
    align: 'right',
    width: 150,
    cellClassName: 'font-numeric',
    accessor: token => `${fNum(balancerFor(token.address), FNumFormats.token)}`,
    sortKey: token => {
      const value = Number(balancerFor(token.address));
      if (value === Infinity || isNaN(value)) return 0;
      return value;
    },
  },
  {
    name: '',
    id: 'unwrap',
    align: 'right',
    accessor: 'unwrap',
    Cell: 'unwrapColumnCell',
    width: 150,
  },
]);
</script>

<template>
  <div>
    <h4 class="mb-2">1. Unstake your Pool Tokens</h4>
    <BalCard
      shadow="lg"
      :square="upToLargeBreakpoint"
      :noBorder="upToLargeBreakpoint"
      noPad
    >
      <BalTable
        :columns="columns"
        :data="tokensList"
        skeletonClass="h-64"
        :square="upToLargeBreakpoint"
        :isLoading="isLoading"
        :onRowClick="handleRowClick"
        :initialState="{
          sortColumn: 'balance',
          sortDirection: 'desc',
        }"
      >
        <template #iconColumnHeader>
          <div class="flex items-center">
            <img
              v-if="darkMode"
              :src="TokensWhite"
              alt="token"
              loading="lazy"
              width="24"
              height="15"
            />
            <img
              v-else
              :src="TokensBlack"
              alt="token"
              loading="lazy"
              width="24"
              height="15"
            />
          </div>
        </template>
        <template #iconColumnCell="token">
          <div v-if="!isLoading" class="py-4 px-6 text-left">
            <BalAsset
              :address="token.address"
              :iconURI="token.logoURI"
              :size="28"
            />
          </div>
        </template>
        <template #riskCell="token">
          <div
            v-if="!isLoading"
            class="flex justify-end items-center py-4 px-6 text-right"
          >
            <BalChip
              v-if="isHighRisk(poolIdFor(token))"
              label="High risk"
              color="red"
            />
            <BalChip v-else label="Mitigated" color="orange" />
          </div>
        </template>
        <template #unwrapColumnCell="token">
          <div class="flex justify-end py-4 px-6">
            <TxActionBtn
              label="Unstake"
              color="gradient"
              size="sm"
              :actionFn="() => unstake(token)"
              action="unstake"
              :summary="fNum(balancerFor(token.address), FNumFormats.token)"
              :confirmingLabel="`Unstaking...`"
              :disabled="unstakeDisabled(token)"
              @confirmed="refetchBalances"
            />
          </div>
        </template>
      </BalTable>
    </BalCard>
  </div>
</template>
