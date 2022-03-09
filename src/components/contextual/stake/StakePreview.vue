<script setup lang="ts">
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import useTokens from '@/composables/useTokens';
import useTransactions from '@/composables/useTransactions';
import QUERY_KEYS from '@/constants/queryKeys';
import { bnum } from '@/lib/utils';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';
import { MAX_UINT } from '@balancer-labs/sor/dist/sor';
import { BigNumber, Contract } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { last } from 'lodash';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQueryClient } from 'vue-query';
import { UserGuageSharesResponse } from '../pages/pools/StakedPoolsTable.vue';

type Props = {
  pool: FullPool;
  isVisible: boolean;
};

const props = defineProps<Props>();
const emit = defineEmits(['close']);
/**
 * COMPOSABLES
 */
const { balanceFor, getToken } = useTokens();
const { fNum2 } = useNumbers();
const { addTransaction } = useTransactions();
const { t } = useI18n();
const { account, getProvider } = useWeb3();
const { txListener } = useEthers();
const queryClient = useQueryClient();
const { tokenApprovalActions } = useTokenApprovalActions(
  [props.pool.address],
  ref([balanceFor(props.pool.address).toString()])
);

/* COMPUTED */
const stakeActions = computed((): TransactionActionInfo[] => [
  ...tokenApprovalActions,
  {
    label: t('stake'),
    loadingLabel: t('staking.staking'),
    confirmingLabel: t('confirming'),
    action: stakeBPT,
    stepTooltip: 'Stake'
  }
]);

const assetRowWidth = computed(
  () => (props.pool.tokenAddresses.length * 32) / 1.5
);

const poolShareData = computed(() => {
  const numSharesToStake = balanceFor(props.pool.address);

  // grab the existing query response which should have loaded
  // if those modal is openable
  const guageSharesData = (last(
    queryClient.getQueriesData(['gauges', 'shares'])
  ) || [])[1] as UserGuageSharesResponse;

  // gauge for this pool
  const relevantGauge = guageSharesData.gaugeShares.find(
    ({ gauge }) => gauge.poolId === props.pool.id
  );

  const existingSharePct = bnum(relevantGauge?.balance || '0').div(
    props.pool.totalShares
  );

  const addedSharePct = bnum(numSharesToStake).div(props.pool.totalShares);
  const totalSharePct = bnum(existingSharePct).plus(addedSharePct);

  const addedValueInFiat = bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times(numSharesToStake)

    .toString();
  return {
    existingSharePct,
    addedValueInFiat,
    addedSharePct,
    totalSharePct
  };
});

async function approveBPT() {
  const gauge = new LiquidityGauge(
    '0x5be3bbb5d7497138b9e623506d8b6c6cd72daceb',
    getProvider()
  );
  const tx = await gauge.approve(props.pool.address);
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'approve',
    summary: 'approveBPT'
  });

  txListener(tx, {
    onTxConfirmed: async () => {
      console.log('bingo');
    },
    onTxFailed: () => {
      console.log('bongo');
    }
  });
}

async function unstakeBPT() {
  //   const gauge = new LiquidityGauge(
  //   '0x5be3bbb5d7497138b9e623506d8b6c6cd72daceb',
  //   getProvider()
  // );
  // const tx = await gauge.unstake(parseUnits(balanceFor(props.pool.address), 18));
  // addTransaction({
  //   id: tx.hash,
  //   type: 'tx',
  //   action: 'stake',
  //   summary: 'stakeBPT'
  // });
  // txListener(tx, {
  //   onTxConfirmed: async () => {
  //     console.log('bingo');
  //   },
  //   onTxFailed: () => {
  //     console.log('bongo');
  //   }
  // });
}

async function stakeBPT() {
  const gauge = new LiquidityGauge(
    '0x5be3bbb5d7497138b9e623506d8b6c6cd72daceb',
    getProvider()
  );
  const tx = await gauge.stake(parseUnits(balanceFor(props.pool.address), 18));
  return tx;
}
/** FUNCTIONS */
function handleSuccess() {
  //
}
</script>

<template>
  <BalStack vertical>
    <h4>{{ $t('staking.stakeLPTokens') }}</h4>
    <BalCard shadow="none" noPad class="px-4 py-2">
      <BalStack horizontal justify="between" align="center">
        <BalStack vertical spacing="none">
          <h5>{{ fNum2(balanceFor(pool.address)) }} {{ $t('lpTokens') }}</h5>
          <span class="text-gray-500">
            {{ getToken(pool.address).symbol }}
          </span>
        </BalStack>
        <BalAssetSet
          :addresses="pool.tokenAddresses"
          :width="assetRowWidth"
          :size="32"
        />
      </BalStack>
    </BalCard>
    <BalCard shadow="none" noPad>
      <div class="border-b p-2">
        <h6 class="text-sm">{{ $t('summary') }}</h6>
      </div>
      <BalStack vertical spacing="xs" class="p-3">
        <BalStack horizontal justify="between">
          <span class="text-sm">{{ $t('staking.totalValueToStake') }}:</span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize"
              >~{{
                fNum2(poolShareData.addedValueInFiat, FNumFormats.fiat)
              }}</span
            >
            <BalTooltip text="s" width="20" textCenter />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between">
          <span class="text-sm">{{ $t('staking.newTotalShare') }}:</span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize"
              >~{{
                fNum2(poolShareData.totalSharePct, FNumFormats.percent)
              }}</span
            >
            <BalTooltip text="s" width="20" textCenter />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between">
          <span class="text-sm">{{ $t('staking.potentialStakingApr') }}:</span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize">sdfs</span>
            <BalTooltip text="s" width="20" textCenter />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between">
          <span class="text-sm">{{ $t('staking.potentialWeeklyEarning') }}:</span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize">sdfs</span>
            <BalTooltip text="s" width="20" textCenter />
          </BalStack>
        </BalStack>
      </BalStack>
    </BalCard>
    <BalActionSteps :actions="stakeActions" @success="handleSuccess" />
    <BalStack horizontal align="center" justify="center" class="text-gray-600 hover:text-gray-800 hover:underline">
      <router-link :to="{ name: 'pool', params: { id: pool.id } }">
        <BalStack horizontal align="center" spacing="xs">
          <span
            >{{ $t('getLpTokens') }}: {{ getToken(pool.address).symbol }}</span
          >
          <BalIcon name="arrow-up-right" />
        </BalStack>
      </router-link>
    </BalStack>
  </BalStack>
</template>
