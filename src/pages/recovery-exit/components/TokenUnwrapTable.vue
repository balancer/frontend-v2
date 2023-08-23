<script lang="ts" setup>
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useGraphQuery from '@/composables/queries/useGraphQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import { networkId } from '@/composables/useNetwork';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum, isSameAddress } from '@/lib/utils';
import { balancerTokenLists } from '@/providers/token-lists.provider';
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
import { pickBy, uniqBy } from 'lodash';
import {
  BatchRelayerService,
  LinearPoolType,
} from '@/services/balancer/batch-relayer/batch-relayer.service';
import { parseUnits } from '@ethersproject/units';
import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { ApprovalAction } from '@/composables/approvals/types';
import useRelayerApproval, {
  RelayerType,
} from '@/composables/approvals/useRelayerApproval';

const tokenService = new TokenService();

const TOKENS_TO_EXCLUDE = [
  '0xa0d3707c569ff8c87fa923d3823ec5d81c98be78', // iETHv2 (Speak to Rab for context)
];

/**
 * TYPES
 */
type PoolsQueryResponse = {
  pools: {
    id: string;
    wrappedIndex: string;
    factory: string;
    poolType: string;
    tokens: {
      address: string;
      index: string;
    }[];
  }[];
};

type Props = {
  withdrawalEvents: number;
};

/**
 * Props
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { account, explorerLinks, getSigner } = useWeb3();
const { fNum } = useNumbers();
const { upToLargeBreakpoint } = useBreakpoints();
const { darkMode } = useDarkMode();
const { approveToken } = useTokenApprovalActions();
const { relayerApprovalTx } = useRelayerApproval(RelayerType.BATCH);

/**
 * COMPUTED + QUERIES
 */
// Query 1:
// Fetch all linear pools for the current network and get the wrapped token
// index + address.
const linearPoolsQuery = useGraphQuery<PoolsQueryResponse>(
  configService.network.subgraph,
  ['tokenUnwrap', 'pools', { networkId }],
  () => ({
    pools: {
      __args: {
        first: 1000,
        where: {
          poolType_contains: 'Linear',
        },
      },
      id: true,
      wrappedIndex: true,
      factory: true,
      poolType: true,
      tokens: {
        address: true,
        index: true,
      },
    },
  }),
  {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  }
);

const allLineaPools = computed(() => linearPoolsQuery.data.value?.pools ?? []);
const allWrappedTokensWithType = computed(
  (): { wrapped: string; poolType: string }[] =>
    uniqBy(
      allLineaPools.value.map(pool => ({
        wrapped: (
          pool.tokens.find(token => token.index === pool.wrappedIndex) ||
          pool.tokens[pool.wrappedIndex]
        )?.address as string,
        poolType: pool.poolType,
      })),
      'wrapped'
    )
);
const enableTokenQuery = computed(
  (): boolean => allWrappedTokensWithType.value.length > 0
);

// Query 2:
// Fetch metadata for all wrapped token addresses provided by query 1.
const tokensQuery = useQuery(
  [
    'tokenUnwrap',
    'tokens',
    {
      networkId,
      allWrappedTokenAddressesWithFactory: allWrappedTokensWithType,
    },
  ],
  async () =>
    tokenService.metadata.get(
      allWrappedTokensWithType.value
        .map(item => item.wrapped)
        .filter(address => !TOKENS_TO_EXCLUDE.includes(address.toLowerCase())),
      balancerTokenLists.value
    ),
  { enabled: enableTokenQuery }
);

const tokens = computed((): TokenInfoMap => tokensQuery.data.value ?? {});
const enableBalancesQuery = computed(
  (): boolean => Object.keys(tokens.value).length > 0 && !!account.value
);

// Query 3:
// Fetch user balances for all wrapped token addresses provided by query 1.
const balancesQuery = useQuery(
  ['tokenUnwrap', 'balances', { networkId, tokens }],
  async () => tokenService.balances.get(account.value, tokens.value),
  { enabled: enableBalancesQuery }
);

const balances = computed(() => balancesQuery.data.value || {});
const enableAllowancesQuery = computed((): boolean =>
  Object.values(balances.value).some(amount => bnum(amount).gt(0))
);

// Query 4:
// Fetch user allowances for tokens with balance for the vault and relayer.
const allowancesQuery = useQuery(
  ['tokenUnwrap', 'allowances', { networkId, balances }],
  async () =>
    tokenService.allowances.get(
      account.value,
      [configService.network.addresses.vault],
      tokens.value
    ),
  { enabled: enableAllowancesQuery }
);

const allowances = computed(() => allowancesQuery.data.value || {});

const isLoading = computed(
  (): boolean =>
    isQueryLoading(linearPoolsQuery) ||
    isQueryLoading(tokensQuery) ||
    isQueryLoading(balancesQuery) ||
    isQueryLoading(allowancesQuery)
);

const tokensWithBalance = computed(
  (): TokenInfoMap =>
    pickBy(tokens.value, token => bnum(balancerFor(token.address)).gt(0))
);

// The list of tokens to display in the table.
const tokensList = computed(() => Object.values(tokensWithBalance.value));

/**
 * METHODS
 */
async function unwrap(token: TokenInfo) {
  const signer = getSigner();
  const batchRelayerService = new BatchRelayerService();

  const item = allWrappedTokensWithType.value.find(item =>
    isSameAddress(item.wrapped, token.address)
  );
  const amount = parseUnits(balancerFor(item?.wrapped || ''), token.decimals);

  return batchRelayerService.unwrapLinearPoolWrappedToken({
    signer,
    batchRelayerAddress: configService.network.addresses.batchRelayer,
    wrappedToken: item?.wrapped || '',
    poolType: item?.poolType as LinearPoolType,
    sender: account.value,
    recipient: account.value,
    amount,
  });
}

async function approve(token: TokenInfo) {
  return approveToken({
    token,
    normalizedAmount: balancerFor(token.address),
    spender: configService.network.addresses.vault,
    actionType: ApprovalAction.Unwrapping,
  });
}

function balancerFor(address: string): string {
  return balances.value[getAddress(address)];
}

function allowanceFor(address: string): string {
  return (
    allowances.value?.[configService.network.addresses.vault]?.[
      getAddress(address)
    ] ?? '0'
  );
}

function handleRowClick(token: TokenInfo) {
  window.open(explorerLinks.addressLink(token.address));
}

function unwrapDisabled(token): boolean {
  return bnum(balancerFor(token.address)).lte(0);
}

function requiresApproval(token: TokenInfo): boolean {
  return bnum(allowanceFor(token.address)).lt(balancerFor(token.address));
}

/**
 * WATCHERS
 */
watch(
  () => props.withdrawalEvents,
  () => balancesQuery.refetch()
);

/**
 * TABLE DEFINITION
 */
const columns = computed((): ColumnDefinition<TokenInfo>[] => [
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
    name: 'Token',
    id: 'token',
    width: 150,
    className: 'px-0',
    accessor: token => token.symbol,
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
    width: upToLargeBreakpoint.value ? 200 : 100,
  },
]);
</script>

<template>
  <div>
    <h4 class="mb-2">3. Unwrap your tokens</h4>
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
        <template #unwrapColumnCell="token">
          <div class="flex justify-end py-4 px-6">
            <TxActionBtn
              v-if="requiresApproval(token)"
              label="Approve Vault"
              color="gradient"
              size="sm"
              :actionFn="() => approve(token)"
              action="approve"
              :summary="fNum(balancerFor(token.address), FNumFormats.token)"
              :confirmingLabel="`Approving...`"
              disableNotification
              :disabled="allowancesQuery.isRefetching.value"
              @confirmed="allowancesQuery.refetch()"
            />
            <TxActionBtn
              v-else-if="!relayerApprovalTx.isUnlocked.value"
              label="Approve Relayer"
              color="gradient"
              size="sm"
              :actionFn="() => relayerApprovalTx.approve()"
              action="approve"
              :summary="fNum(balancerFor(token.address), FNumFormats.token)"
              :confirmingLabel="`Approving...`"
              disableNotification
              :disabled="relayerApprovalTx.loading.value"
            />
            <TxActionBtn
              v-else
              label="Unwrap"
              color="gradient"
              size="sm"
              :actionFn="() => unwrap(token)"
              action="unwrap"
              :summary="fNum(balancerFor(token.address), FNumFormats.token)"
              :confirmingLabel="`Unwrapping...`"
              :disabled="unwrapDisabled(token)"
              @confirmed="balancesQuery.refetch()"
            />
          </div>
        </template>
      </BalTable>
    </BalCard>
  </div>
</template>
