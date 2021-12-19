<script setup lang="ts">
import { TransactionReceipt } from '@ethersproject/providers';
import { computed, ref, watch } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { CopperProxyService } from '@/beethovenx/services/pool/copper-proxy.service';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { FullPool } from '@/services/balancer/subgraph/types';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import BalToggle from '@/components/_global/BalToggle/BalToggle.vue';
import useLge from '@/beethovenx/lbp/composables/useLge';

type Props = {
  lge: GqlLge;
  pool: FullPool;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'adminEvent'): void;
}>();

const { appNetworkConfig, getProvider, account } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();

const modalOpen = ref(false);
const copperProxyService = computed(
  () => new CopperProxyService(appNetworkConfig.key)
);

const poolExited = computed(
  () => parseFloat(props.pool.totalShares) < 0.00000001
);

const togglingSwapsEnabled = ref(false);
const exitingPool = ref(false);

const { onNewTx } = useLge(props.lge, props.pool);

async function toggleSwaps(enable: boolean): Promise<void> {
  try {
    togglingSwapsEnabled.value = true;

    const tx = await copperProxyService.value.setSwapEnabled(
      getProvider(),
      props.lge.address,
      enable
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'trade',
      summary: `${enable ? 'Enabling' : 'Disabling'} swaps for your LBP`
    });

    txListener(tx, {
      onTxConfirmed: async () => {
        togglingSwapsEnabled.value = false;
        onNewTx();
        emit('adminEvent');
      },
      onTxFailed: () => {
        togglingSwapsEnabled.value = false;
      }
    });
  } catch (error) {
    console.error(error);
    togglingSwapsEnabled.value = false;
  }
}

async function exitPool(): Promise<void> {
  try {
    exitingPool.value = true;

    const tx = await copperProxyService.value.exitPool(
      getProvider(),
      props.lge.address
    );

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'withdraw',
      summary: 'Withdrawing all assets from your LBP'
    });

    txListener(tx, {
      onTxConfirmed: async () => {
        exitingPool.value = false;
        onNewTx();
        emit('adminEvent');
      },
      onTxFailed: () => {
        exitingPool.value = false;
      }
    });
  } catch (error) {
    console.error(error);
    exitingPool.value = false;
  }
}

function closeModal() {
  modalOpen.value = false;
}
</script>

<template>
  <BalBtn @click="modalOpen = true">LGE Admin</BalBtn>
  <BalModal :show="modalOpen" @close="closeModal">
    <h3>LGE Admin</h3>
    <div class="mt-8">
      <div class="mb-4">
        Enabling swaps will make it possible for users to buy and sell your
        token. We recommend that you enable swaps right as the price decay
        begins and disable swaps right as the price decay ends.
      </div>
      <BalBtn
        v-if="props.pool.swapEnabled"
        @click="toggleSwaps(false)"
        :loading="togglingSwapsEnabled"
        loading-label="Disabling..."
      >
        Disable Swaps
      </BalBtn>
      <BalBtn
        v-else
        @click="toggleSwaps(true)"
        :loading="togglingSwapsEnabled"
        loading-label="Enabling..."
      >
        Enable Swaps
      </BalBtn>
    </div>
    <div class="mb-4 mt-12">
      Exiting the pool will burn your BPT and return all pool funds to your
      wallet. You should only exit the pool after the LGE has come to an end.
    </div>
    <BalBtn
      @click="exitPool()"
      color="red"
      :loading="exitingPool"
      loading-label="Exiting..."
      class="mb-4"
      :disabled="poolExited"
    >
      Exit Pool
    </BalBtn>
  </BalModal>
</template>
