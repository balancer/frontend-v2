<script setup lang="ts">
import { POOLS } from '@/constants/pools';
import { poolMetadata } from '@/lib/config/metadata';
import { shortenLabel } from '@/lib/utils';
import { Pool, PoolType } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';
import { EXTERNAL_LINKS } from '@/constants/links';
import { configService } from '@/services/config/config.service';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  loading: boolean;
  metadata: MetadataList;
};

type MetadataList = {
  title: string;
  value: string;
  key?: string;
  [key: string]: any;
}[];

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

/**
 * STATE
 */
const poolCustomMetadata = ref<MetadataList>([]);
const customMetadataPoolName = ref<string>();
const isCustomMetadata = ref(false);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { explorerLinks: explorer, account } = useWeb3();
const { network } = configService;
const networkName =
  network.shortName.toLocaleLowerCase() === 'mainnet'
    ? 'ethereum'
    : network.shortName.toLocaleLowerCase();

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
  } = props.pool;

  return [
    {
      title: t('attribute'),
      value: t('details'),
    },
    {
      title: t('poolName'),
      value: customMetadataPoolName.value || poolMetadata(id)?.name || name,
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
      value: `${Number(swapFee) * 100}% (${formSwapFeesHint(owner || '')})`,
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

const isPoolOwner = computed(() => {
  return (
    account.value.toLocaleLowerCase() === props.pool.owner?.toLocaleLowerCase()
  );
});

watch(
  () => props.metadata,
  newMetadata => {
    if (Array.isArray(newMetadata)) {
      poolCustomMetadata.value = [
        {
          title: t('attribute'),
          value: t('details'),
        },
        ...newMetadata
          .filter(item => item.key?.toLowerCase() !== 'name')
          .map(item => ({
            ...item,
            title: item.key as string,
            key: undefined,
          })),
      ];
    }
  },
  { immediate: true }
);
watch(
  () => props.metadata,
  newMetadata => {
    if (Array.isArray(newMetadata)) {
      const nameItem = newMetadata.find(item => item.key === 'name');
      customMetadataPoolName.value = nameItem ? nameItem.value : undefined;
    } else {
      customMetadataPoolName.value = undefined;
    }
  },
  { immediate: true }
);
watch(
  () => props.metadata,
  newMetadata => {
    if (Array.isArray(newMetadata)) {
      isCustomMetadata.value = newMetadata.length > 0;
    } else {
      isCustomMetadata.value = false;
    }
  },
  { immediate: true }
);
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
    <h3
      v-if="isCustomMetadata"
      class="px-4 lg:px-0 mt-12 mb-5"
      v-text="$t('poolCustomMetadata')"
    />
    <BalDetailsTable
      v-if="isCustomMetadata"
      class="mb-12"
      :tableData="poolCustomMetadata"
    />
    <BalAlert
      v-if="isPoolOwner"
      type="warning"
      :title="$t('poolCustomMetadataOwner.title')"
      class="mt-2"
      block
    >
      {{ $t('poolCustomMetadataOwner.description') }}
      <BalLink
        :href="`${EXTERNAL_LINKS.Bleu.Metadata}${networkName}/pool/${props.pool.id}`"
        external
        noStyle
      >
        <BalIcon
          name="arrow-up-right"
          size="sm"
          class="mt-2 ml-2 text-gray-500 hover:text-blue-500 transition-colors"
        />
      </BalLink>
    </BalAlert>
  </div>
</template>
