<script lang="ts" setup>
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { networkId, networkSlug } from '@/composables/useNetwork';
import {
  CSP_ISSUE_POOL_IDS,
  isHighRisk,
} from '@/constants/pool-lists/csp-issue';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import { useQuery } from '@tanstack/vue-query';
import TokenService from '@/services/token/token.service';
import { balancerTokenLists } from '@/providers/token-lists.provider';
import { bnum } from '@/lib/utils';
import { getAddress } from '@ethersproject/address';
import {
  ExitHandler,
  ExitPoolService,
} from '@/services/balancer/pools/exits/exit-pool.service';
import { ExitType } from '@/services/balancer/pools/exits/handlers/exit-pool.handler';
import { useUserSettings } from '@/providers/user-settings.provider';
import { useApp } from '@/composables/useApp';
import { ColumnDefinition } from '@/components/_global/BalTable/types';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import TokensWhite from '@/assets/images/icons/tokens_white.svg';
import TokensBlack from '@/assets/images/icons/tokens_black.svg';
import useDarkMode from '@/composables/useDarkMode';
import { poolMetadata } from '@/lib/config/metadata';
import {
  fiatValueOf,
  isStableLike,
  orderedPoolTokens,
  orderedTokenAddresses,
} from '@/composables/usePoolHelpers';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import { NO_RECOVERY_EXIT_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import WithdrawalModal from './WithdrawalModal.vue';

const tokenService = new TokenService();

/**
 * PROPS & EMITS
 */
type Props = {
  unstakeEvents: number;
};

const props = defineProps<Props>();
const emit = defineEmits(['withdrawal']);

/**
 * STATE
 */
const showWithdrawalModal = ref(false);
const activePool = ref<Pool | null>(null);

/**
 * COMPOSABLES
 */
const { account, getSigner } = useWeb3();
const { slippageBsp } = useUserSettings();
const { transactionDeadline } = useApp();
const { fNum } = useNumbers();
const { upToLargeBreakpoint } = useBreakpoints();
const { darkMode } = useDarkMode();
const router = useRouter();

/**
 * COMPUTED + QUERIES
 */
const affectedPoolIds = computed(
  (): string[] => CSP_ISSUE_POOL_IDS[networkId.value]
);

const affectedPools = computed(() =>
  affectedPoolIds.value.map(id => ({
    id,
    address: id.slice(0, 42),
  }))
);

const enableBalanceFetching = computed(() => !!account.value);

// Query 1:
// Fetches balances for all affected pools on the current network.
const poolBalancesQuery = useQuery(
  ['CspExit', 'balances', { networkId, account }],
  async () => {
    const poolBpts = await tokenService.metadata.get(
      affectedPools.value.map(pool => pool.address),
      balancerTokenLists.value
    );
    return tokenService.balances.get(account.value, poolBpts);
  },
  { enabled: enableBalanceFetching }
);

const balances = computed(() => poolBalancesQuery.data.value || {});
const poolsWithBalances = computed(() =>
  affectedPools.value.filter(pool => bnum(balancerFor(pool)).gt(0))
);
const enablePoolsQuery = computed(
  () => !!poolsWithBalances.value.length && !isQueryLoading(poolBalancesQuery)
);

// Query 2:
// Fetches only the pools that the user has a balance for from the pools API.
const poolsQuery = useQuery(
  ['CspExit', 'pools', { networkId, poolsWithBalances }],
  async () => {
    return balancerAPIService.pools.get({
      chainId: networkId.value,
      first: 1000,
      where: {
        id: {
          in: poolsWithBalances.value.map(p => p.id),
        },
      },
    });
  },
  { enabled: enablePoolsQuery }
);

// This is the pools list we render.
const pools = computed(() => poolsQuery.data.value || []);

const isLoading = computed(
  () => isQueryLoading(poolBalancesQuery) || isQueryLoading(poolsQuery)
);

/**
 * METHODS
 */
function balancerFor(pool: { address: string }): string {
  return balances.value[getAddress(pool.address)] || '0';
}

async function withdraw(pool: Pool) {
  const exitPoolService = new ExitPoolService(ref(pool));
  exitPoolService.setExitHandler(ExitHandler.Recovery);
  return exitPoolService.exit({
    exitType: ExitType.GivenIn,
    bptIn: balancerFor(pool),
    amountsOut: [],
    signer: getSigner(),
    slippageBsp: slippageBsp.value,
    tokenInfo: {},
    approvalActions: [],
    bptInValid: true,
    transactionDeadline: transactionDeadline.value,
  });
}

function isWithdrawDisabled(pool: Pool): boolean {
  return !pool.isInRecoveryMode;
}

function iconAddresses(pool: Pool) {
  return poolMetadata(pool.id)?.hasIcon
    ? [pool.address]
    : orderedTokenAddresses(pool);
}

function handleRowClick(pool: Pool) {
  const route = router.resolve({
    name: 'pool',
    params: { id: pool.id, networkSlug },
  });
  window.open(route.href);
}

async function refetchBalances() {
  return poolBalancesQuery.refetch();
}

function doesNotSupportRecoveryExits(poolId: string): boolean {
  return NO_RECOVERY_EXIT_POOL_IDS[networkId.value].includes(poolId);
}

function handleWithdrawal() {
  refetchBalances();
  emit('withdrawal');
  closeModal();
}

function handleWithdrawClick(pool: Pool) {
  activePool.value = pool;
  showWithdrawalModal.value = true;
}

function closeModal() {
  showWithdrawalModal.value = false;
  activePool.value = null;
}

/**
 * WATCHERS
 */
watch(
  () => props.unstakeEvents,
  () => refetchBalances()
);

/**
 * TABLE DEFINITION
 */
const columns = ref<ColumnDefinition<Pool>[]>([
  {
    name: 'Icons',
    id: 'icons',
    accessor: 'uri',
    Header: 'iconColumnHeader',
    Cell: 'iconColumnCell',
    width: 125,
    noGrow: true,
  },
  {
    name: 'Composition',
    id: 'poolName',
    accessor: 'id',
    Cell: 'poolNameCell',
    width: 350,
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
    accessor: pool => `${fNum(balancerFor(pool), FNumFormats.token)}`,
  },
  {
    name: 'Value',
    align: 'right',
    id: 'value',
    width: 150,
    cellClassName: 'font-numeric',
    accessor: pool =>
      fNum(fiatValueOf(pool, balancerFor(pool)), FNumFormats.fiat),
    sortKey: pool => {
      const value = Number(fiatValueOf(pool, balancerFor(pool)));
      if (value === Infinity || isNaN(value)) return 0;
      return value;
    },
  },
  {
    name: '',
    id: 'withdraw',
    align: 'right',
    accessor: 'withdraw',
    Cell: 'withdrawColumnCell',
    width: 150,
  },
]);
</script>

<template>
  <div>
    <h4 class="mb-2">
      2. Withdraw your liquidity (this may require several transactions)
    </h4>
    <BalCard
      shadow="lg"
      :square="upToLargeBreakpoint"
      :noBorder="upToLargeBreakpoint"
      noPad
    >
      <BalTable
        :columns="columns"
        :data="pools"
        skeletonClass="h-64"
        :square="upToLargeBreakpoint"
        :isLoading="isLoading"
        :onRowClick="handleRowClick"
        :initialState="{
          sortColumn: 'value',
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
        <template #iconColumnCell="pool">
          <div v-if="!isLoading" class="py-4 px-6" :data-testid="pool?.id">
            <BalAssetSet :addresses="iconAddresses(pool)" :width="100" />
          </div>
        </template>
        <template #poolNameCell="pool">
          <div v-if="!isLoading" class="flex items-center py-4 px-6">
            <div v-if="poolMetadata(pool.id)?.name" class="pr-2 text-left">
              {{ poolMetadata(pool.id)?.name }}
            </div>
            <div v-else>
              <TokenPills
                :tokens="orderedPoolTokens(pool, pool.tokens)"
                :isStablePool="isStableLike(pool.poolType)"
              />
            </div>
          </div>
        </template>
        <template #riskCell="pool">
          <div
            v-if="!isLoading"
            class="flex justify-end items-center py-4 px-6 text-right"
          >
            <BalChip v-if="isHighRisk(pool.id)" label="High risk" color="red" />
            <BalChip v-else label="Mitigated" color="orange" />
          </div>
        </template>
        <template #withdrawColumnCell="pool">
          <div class="flex justify-end py-4 px-6">
            <BalBtn
              v-if="doesNotSupportRecoveryExits(pool.id)"
              tag="a"
              color="gradient"
              size="sm"
              :href="`/#/${networkSlug}/pool/${pool.id}/withdraw`"
              target="_blank"
              rel="noreferrer"
              @click.stop
            >
              Withdraw
              <BalIcon name="arrow-up-right" size="sm" />
            </BalBtn>
            <BalBtn
              v-else
              color="gradient"
              size="sm"
              :disabled="isWithdrawDisabled(pool)"
              @click.stop="handleWithdrawClick(pool)"
            >
              Withdraw
            </BalBtn>
          </div>
        </template>
      </BalTable>
    </BalCard>

    <WithdrawalModal
      v-if="showWithdrawalModal && activePool"
      :pool="activePool"
      :balance="balancerFor(activePool)"
      :iconAddresses="iconAddresses(activePool)"
      :withdrawFn="() => withdraw(activePool as Pool)"
      @close="closeModal"
      @success="handleWithdrawal"
    />
  </div>
</template>
