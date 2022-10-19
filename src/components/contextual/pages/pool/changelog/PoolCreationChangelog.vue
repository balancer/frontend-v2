<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { POOLS } from '@/constants/pools';
import { Pool } from '@/services/pool/types';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * TYPES
 */
type Props = {
  poolCreation: any;
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
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const data = computed(() => {
  const { poolType, tokensList, owner, swapFee } = props.pool;
  const isImmutable = owner === POOLS.ZeroAddress;

  const isEditable = !isImmutable;
  const icon = isEditable ? 'check' : 'cross';

  const isSwapsEnabled = !isImmutable;
  const enableText = isSwapsEnabled
    ? t('changelog.poolCreation.enabled')
    : t('changelog.poolCreation.disabled');
  const hasPermission = true;
  const permissionText = hasPermission
    ? t('changelog.poolCreation.permissionless')
    : '';

  return [
    [
      {
        text: t('changelog.poolCreation.setting'),
      },
      {
        text: t('changelog.poolCreation.initial'),
      },
      {
        text: t('changelog.poolCreation.editable'),
      },
    ],
    [
      {
        text: t('poolType'),
      },
      { text: poolType },
      { icon },
    ],
    [
      {
        text: t('changelog.poolCreation.tokensNum'),
      },
      { text: tokensList.length },
      { icon },
    ],
    [
      {
        text: t('changelog.poolCreation.swaps'),
      },
      { text: enableText },
      { icon },
    ],
    [
      {
        text: t('swapFee'),
      },
      { text: fNum2(swapFee, FNumFormats.percent) },
      { icon },
    ],
    [
      {
        text: t('changelog.poolCreation.permissionless'),
      },
      { text: permissionText },
      { icon },
    ],
  ];
});
</script>

<template>
  <div>
    <div class="mb-4 text-lg text-semibold">
      {{ $t('changelog.poolCreation.attributes') }}
    </div>

    <BalDetailsTable class="mb-12" :tableData="data" />
  </div>
</template>

