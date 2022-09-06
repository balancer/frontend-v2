<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { POOLS } from '@/constants/pools';
import { shortenLabel } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { format } from 'date-fns';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading: boolean;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { explorerLinks: explorer } = useWeb3();
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const data = computed(() => [
  {
    title: t('attribute'),
    value: t('details'),
  },
  {
    title: t('poolName'),
    value: POOLS.Metadata[props.pool.id]?.name || shortenLabel(props.pool.id),
  },
  {
    title: t('poolSymbol'),
    value: props.pool.symbol,
    link: explorer.addressLink(props.pool?.address || ''),
  },
  {
    title: t('poolType'),
    value: props.pool.poolType,
  },
  {
    title: t('poolManagement'),
    value: 'Details',
  },
  {
    title: t('contractAddress'),
    value: props.pool.address,
    link: explorer.addressLink(props.pool?.address || ''),
  },
  {
    title: t('owner'),
    value: props.pool.owner,
  },
  {
    title: t('createDate'),
    value: format(props.pool.createTime * 1000, 'dd MMMM yyyy'),
  },
  {
    title: t('swapFees'),
    value: fNum2(props.pool.swapFee, FNumFormats.percent),
  },
]);
</script>

<template>
  <h4 class="px-4 lg:px-0 mb-5" v-text="$t('poolDetails')" />

  <BalDetailsTable :tableData="data" />
</template>

