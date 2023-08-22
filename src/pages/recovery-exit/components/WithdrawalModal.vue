<script lang="ts" setup>
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { Pool } from '@/services/pool/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import TxActionBtn from '@/components/btns/TxActionBtn/TxActionBtn.vue';
import { poolMetadata } from '@/lib/config/metadata';

type Props = {
  pool: Pool;
  balance: string;
  iconAddresses: string[];
  withdrawFn: () => Promise<TransactionResponse>;
};

const props = defineProps<Props>();
const emit = defineEmits(['close', 'success']);

const { fNum } = useNumbers();

const assetRowWidth = computed(() => (props.iconAddresses.length * 32) / 1.5);
</script>

<template>
  <BalModal show @close="emit('close')">
    <template #header>
      <h4>Proportionally withdraw</h4>
    </template>
    <BalCard class="mb-4">
      <BalStack horizontal justify="between" align="center">
        <BalStack vertical spacing="none">
          <h5>{{ fNum(balance) }} {{ $t('lpTokens') }}</h5>
          <div v-if="poolMetadata(pool.id)?.name" class="text-secondary">
            {{ poolMetadata(pool.id)?.name }}
          </div>
          <span v-else class="text-secondary">
            {{ pool.symbol }}
          </span>
        </BalStack>
        <BalAssetSet
          :addresses="iconAddresses"
          :width="assetRowWidth"
          :size="32"
        />
      </BalStack>
    </BalCard>
    <p>
      The withdraw transaction will perform a recovery exit from this pool. This
      type of withdrawal results in zero price impact, as tokens are withdrawn
      in the same proportions as the pool balances. If this pool contains nested
      pool tokens, you will need to perform additional transactions to withdraw
      from nested pools.
    </p>
    <template #footer>
      <TxActionBtn
        label="Withdraw"
        color="gradient"
        :actionFn="() => withdrawFn()"
        action="withdraw"
        :summary="
          $t('transactionSummary.withdrawFromBalance', [
            fNum(balance, FNumFormats.token),
          ])
        "
        confirmingLabel="Withdrawing..."
        block
        @confirmed="emit('success')"
      />
    </template>
  </BalModal>
</template>
