<script setup lang="ts">
import useNumbers from '@/composables/useNumbers';
import { POOLS } from '@/constants/pools';
import { poolMetadata } from '@/lib/config/metadata';
import { shortenLabel } from '@/lib/utils';
import { Pool, PoolType } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { explorerLinks: explorer } = useWeb3();
const { fNum } = useNumbers();

function formSwapFeesHint(owner: string): string {
  if (owner === POOLS.ZeroAddress) {
    return t('poolAttrs.feesFixed');
  }

  if (owner === POOLS.DelegateOwner) {
    return t('poolAttrs.feesEditableGovernance');
  }

  return t('poolAttrs.feesEditableOwner');
}
/**
 * COMPUTED
 */
const data = computed(() => {
  const {
    poolType,
    address,
    symbol,
    owner,
    createTime,
    swapFee,
    name,
    id,
    onchain,
    priceRateProviders,
    tokens,
  } = props.pool;

  const filteredPriceRateProviders = priceRateProviders?.filter(
    provider => provider.address !== POOLS.ZeroAddress
  );

  return [
    {
      title: t('attribute'),
      value: t('details'),
    },
    {
      title: t('poolName'),
      value: poolMetadata(id)?.name || name,
    },
    {
      title: t('poolSymbol'),
      value: symbol || '',
    },
    {
      title: t('poolType'),
      value: poolType,
    },
    onchain?.amp && Number(onchain?.amp)
      ? {
          title: t('ampFactor.title'),
          value: onchain.amp,
        }
      : null,
    {
      title: t('swapFees'),
      value: `${fNum(swapFee, {
        style: 'percent',
        maximumFractionDigits: 4,
      })} (${formSwapFeesHint(owner || '')})`,
    },
    {
      title: t('poolManager'),
      value: poolType === PoolType.Managed ? t('yes') : t('none'),
    },
    owner
      ? {
          title: t('poolOwner'),
          value: poolOwnerData.value.title,
          link: poolOwnerData.value.link,
          tooltip: poolOwnerTooltip.value,
        }
      : null,
    filteredPriceRateProviders && filteredPriceRateProviders.length > 0
      ? {
          title: 'Rate providers',
          linksList: filteredPriceRateProviders.map(provider => ({
            title: shortenLabel(provider.address),
            link: explorer.addressLink(provider.address),
            tokenSymbol: tokens.find(
              token => token.address === provider.token.address
            )?.symbol,
            warningText:
              'A rate provider provides critical information to the pool and can be drained should it report bad prices. Review the Terms of Use for more information about service providers risks.',
          })),
        }
      : null,
    {
      title: t('contractAddress'),
      value: shortenLabel(address),
      link: explorer.addressLink(address || ''),
    },
    {
      title: t('createDate'),
      value: format((createTime || 0) * 1000, 'dd MMMM yyyy'),
    },
  ];
});

const poolOwnerData = computed(() => {
  const { owner } = props.pool;
  if (owner === POOLS.ZeroAddress) {
    return { title: t('noOwner'), link: '' };
  }

  if (owner === POOLS.DelegateOwner) {
    return { title: t('delegateOwner.title'), link: '' };
  }

  return {
    title: shortenLabel(owner || ''),
    link: explorer.addressLink(owner || ''),
  };
});

const poolOwnerTooltip = computed(() => {
  if (props.pool.owner === POOLS.DelegateOwner) {
    return t('delegateOwner.tooltip');
  }

  return '';
});

const poolManagementText = computed(() => {
  if (props.pool.poolType === PoolType.Managed) {
    return t('');
  }

  if (props.pool.owner === POOLS.ZeroAddress) {
    return t('poolAttrs.immutable');
  }

  if (props.pool.owner === POOLS.DelegateOwner) {
    return t('poolAttrs.immutableFeesEditableByGovernance');
  }

  return t('poolAttrs.immutableFeesEditableByOwner');
});
</script>

<template>
  <div class="mb-5">
    <h3 class="px-4 lg:px-0 mb-5" v-text="$t('poolDetails')" />

    <BalDetailsTable class="mb-12" :tableData="data" />
    <template v-if="poolManagementText">
      <h4 class="px-4 lg:px-0 mb-2" v-text="$t('poolManagement')" />
      <div class="px-4 lg:px-0">
        {{ poolManagementText }}
      </div>
    </template>
  </div>
</template>
