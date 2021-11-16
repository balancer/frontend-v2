<script setup lang="ts">
import { toRef, ref, toRefs, computed, ComputedRef, reactive } from 'vue';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { getPoolWeights } from '@/services/pool/pool.helper';
// Types
import { FullPool } from '@/services/balancer/subgraph/types';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import useTokenFiatMath from '@/composables/useTokenFiatMath';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';
import { useI18n } from 'vue-i18n';
import { dateTimeLabelFor } from '@/composables/useTime';
import { useRoute } from 'vue-router';

import useConfig from '@/composables/useConfig';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import {
  TransactionActionInfo,
} from '@/types/transactions';
import BalActionSteps from '@/components/_global/BalActionSteps/BalActionSteps.vue';

/**
 * TYPES
 */
type Props = {
  tokenAddresses: string[];
  amounts: string[];
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
}>();

/**
 * STATE
 */

let poolCreated = false;

/*
 * COMPOSABLES
 */
// const route = useRoute();
const { t } = useI18n();
const { tokenApprovalActions } = useTokenApprovalActions(
  props.tokenAddresses,
  ref(props.amounts)
);
const { createPool, joinPool } = usePoolCreation();

/**
 * COMPUTED
 */

const actions = computed((): TransactionActionInfo[] => [
  ...tokenApprovalActions,
  {
    label: t('createPool'),
    loadingLabel: t('investment.preview.loadingLabel.create'),
    confirmingLabel: t('confirming'),
    action: createPool,
    stepTooltip: t('createPoolTooltip')
  },
  {
    label: t('joinPool'),
    loadingLabel: t('investment.preview.loadingLabel.investment'),
    confirmingLabel: t('confirming'),
    action: joinPool,
    stepTooltip: t('investmentTooltip')
  }
]);

</script>

<template>
  <div>
    <BalActionSteps :actions="actions" @success="poolCreated = true" />
    <template v-if="poolCreated">
      <div
        class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
      >
        <div class="flex items-center">
          <BalIcon name="clock" />
          <span class="ml-2">
            {{ joinPoolState.confirmedAt }}
          </span>
        </div>
        <BalLink
          :href="explorerLink"
          external
          noStyle
          class="group flex items-center"
        >
          {{ networkConfig.explorerName }}
          <BalIcon
            name="arrow-up-right"
            size="sm"
            class="ml-px group-hover:text-pink-500 transition-colors"
          />
        </BalLink>
      </div>
      <BalBtn
        tag="router-link"
        :to="{ name: 'pool', params: { id: route.params.id } }"
        color="gray"
        outline
        block
        class="mt-2"
      >
        {{ $t('returnToPool') }}
      </BalBtn>
    </template> -->
  </div>
</template>
