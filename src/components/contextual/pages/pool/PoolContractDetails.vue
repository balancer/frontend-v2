<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { Pool, PoolType } from '@/services/pool/types';
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
const data = computed(() => {
  const { poolType, address, symbol, owner, createTime, swapFee, name } =
    props.pool;

  return [
    {
      title: t('attribute'),
      value: t('details'),
    },
    {
      title: t('poolName'),
      value: name,
    },
    {
      title: t('poolSymbol'),
      value: symbol,
      link: explorer.addressLink(address || ''),
    },
    {
      title: t('poolType'),
      value: poolType,
    },
    {
      title: t('poolManagement'),
      value: poolType === PoolType.Managed ? t('yes') : t('none'),
    },
    {
      title: t('contractAddress'),
      value: address,
      link: explorer.addressLink(address || ''),
    },
    {
      title: t('owner'),
      value: owner,
    },
    {
      title: t('createDate'),
      value: format(createTime * 1000, 'dd MMMM yyyy'),
    },
    {
      title: t('swapFees'),
      value: fNum2(swapFee, FNumFormats.percent),
    },
  ];
});

const poolManagementText = computed(() => {
  return props.pool.poolType === PoolType.Managed
    ? t('poolAttrs.immutable')
    : t('poolAttrs.immutableFeesEditable');
});
</script>

<template>
  <div>
    <h3 class="px-4 lg:px-0 mb-5" v-text="$t('poolDetails')" />
    <h4 class="px-4 lg:px-0 mb-5" v-text="$t('poolAttrs.contractDetails')" />

    <BalDetailsTable class="mb-20" :tableData="data" />
    <h4 class="px-4 lg:px-0 mb-2" v-text="$t('poolManagement')" />
    {{ poolManagementText }}
  </div>
</template>

