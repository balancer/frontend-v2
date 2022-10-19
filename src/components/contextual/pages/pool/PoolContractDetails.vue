<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { POOLS } from '@/constants/pools';
import { shortenLabel } from '@/lib/utils';
import { Pool, PoolAmpUpdate, PoolType } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { format } from 'date-fns';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  ampUpdates: PoolAmpUpdate[];
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { explorerLinks: explorer } = useWeb3();
const { fNum2 } = useNumbers();

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
    onchain,
  } = props.pool;

  return [
    [
      {
        text: t('attribute'),
      },
      {
        text: t('details'),
      },
    ],
    [
      {
        text: t('poolName'),
      },
      {
        text: name,
      },
    ],
    [
      { text: t('poolSymbol') },
      {
        text: symbol,
      },
    ],
    [
      { text: t('poolType') },
      {
        text: poolType,
      },
    ],
    onchain?.amp
      ? [
          { text: t('ampFactor.title') },
          {
            text: onchain?.amp
              ? `${onchain.amp} (${formSwapFeesHint(owner)})`
              : '',
          },
        ]
      : null,
    [
      { text: t('swapFees') },
      {
        text: `${fNum2(swapFee, FNumFormats.percent)} (${formSwapFeesHint(
          owner
        )})`,
      },
    ],
    [
      { text: t('poolManager') },
      {
        text: poolType === PoolType.Managed ? t('yes') : t('none'),
        link: explorer.addressLink(owner || ''),
      },
    ],
    [
      { text: t('poolOwner') },
      {
        text: shortenLabel(owner),
      },
    ],
    [
      { text: t('contractAddress') },
      {
        text: shortenLabel(address),
        link: explorer.addressLink(address || ''),
      },
    ],
    [
      { text: t('createDate') },
      {
        text: format(createTime * 1000, 'dd MMMM yyyy'),
      },
    ],
  ];
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
  <div>
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

