<script setup lang="ts">
import { computed, reactive } from 'vue';

import useConfig from '@/composables/useConfig';
import useEthers from '@/composables/useEthers';
import useWeb3 from '@/services/web3/useWeb3';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';

import AnimatePresence from '../animate/AnimatePresence.vue';

import { TransactionReceipt } from '@ethersproject/abstract-provider';

type Props = {
  txReceipt: TransactionReceipt;
};

type ConfirmationData = {
  confirmedAt: Date;
  explorerLink: string;
};

const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getTxConfirmedAt } = useEthers();
const { explorerLinks } = useWeb3();
const { networkConfig } = useConfig();

/** COMPUTED */
const isQueryEnabled = computed(() => !!receipt.value?.transactionHash);

const receipt = computed(() => props.txReceipt);

const {
  data: confirmationData,
  isLoading: isFetchingConfirmationDate,
  isIdle
} = useQuery<ConfirmationData>(
  QUERY_KEYS.Transaction.ConfirmationDate(receipt),
  async () => {
    const confirmedAt = await getTxConfirmedAt(receipt.value);
    const explorerLink = explorerLinks.txLink(receipt.value.transactionHash);
    return {
      confirmedAt,
      explorerLink
    };
  },
  reactive({ enabled: isQueryEnabled })
);
</script>

<template>
  <AnimatePresence :isVisible="!isIdle && !isFetchingConfirmationDate">
    <div
      class="flex items-center justify-between text-gray-400 dark:text-gray-600 mt-4 text-sm"
    >
      <div class="flex items-center">
        <BalIcon name="clock" />
        <span class="ml-2">
          {{ confirmationData?.confirmedAt }}
        </span>
      </div>
      <BalLink
        :href="confirmationData?.explorerLink"
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
  </AnimatePresence>
  <AnimatePresence
    :isVisible="!isIdle && isFetchingConfirmationDate"
    unmountInstantly
  >
    <BalLoadingBlock class="h-6" />
  </AnimatePresence>
</template>
