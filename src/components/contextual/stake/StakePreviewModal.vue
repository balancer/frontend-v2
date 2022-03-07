<script setup lang="ts">
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import useEthers from '@/composables/useEthers';
import useNumbers from '@/composables/useNumbers';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import useTokens from '@/composables/useTokens';
import useTransactions from '@/composables/useTransactions';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { FullPool } from '@/services/balancer/subgraph/types';
import useWeb3 from '@/services/web3/useWeb3';
import { MAX_UINT } from '@balancer-labs/sor/dist/sor';
import { BigNumber, Contract } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { computed, ref, toRef } from 'vue';

type Props = {
  pool: FullPool;
};

const props = defineProps<Props>();
/**
 * COMPOSABLES
 */
const { balanceFor, getToken } = useTokens();
const { fNum2 } = useNumbers();
const { addTransaction } = useTransactions();
const { account, getProvider } = useWeb3();
const { txListener } = useEthers();

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
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'stake',
    summary: 'stakeBPT'
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

/**
 * COMPUTED
 */
const assetRowWidth = computed(
  () => (props.pool.tokenAddresses.length * 32) / 1.5
);
</script>

<template>
  <teleport to="#modal">
    <BalModal show>
      <BalStack vertical>
        <h4>{{ $t('staking.stakeLPTokens') }}</h4>
        <BalCard shadow="none" noPad class="px-4 py-2">
          <BalStack horizontal justify="between" align="center">
            <BalStack vertical spacing="none">
              <h5>
                {{ fNum2(balanceFor(pool.address)) }} {{ $t('lpTokens') }}
              </h5>
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
        <BalBtn color="gradient" block @click="approveBPT">{{
          $t('approve')
        }}</BalBtn>
        <BalBtn color="gradient" block @click="stakeBPT">{{
          $t('stake')
        }}</BalBtn>
      </BalStack>
    </BalModal>
  </teleport>
</template>
