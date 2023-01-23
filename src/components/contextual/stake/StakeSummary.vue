<script lang="ts" setup>
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { StakeAction } from './StakePreview.vue';

/**
 * PROPS
 */
type Props = {
  action: StakeAction;
  fiatValue: string;
  sharePercentage: string;
};

defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
</script>

<template>
  <BalDataList :title="$t('summary')">
    <BalDataListRow>
      <template #label>
        {{ $t('totalValueTo') }}
        &nbsp;
        <span class="lowercase">
          {{ action === 'stake' ? $t('stake') : $t('unstake') }}:
        </span>
      </template>
      <template #value>
        <span class="capitalize">
          {{ fNum2(fiatValue, FNumFormats.fiat) }}
        </span>
        <BalTooltip
          :text="
            action === 'stake'
              ? $t('staking.stakeValueTooltip')
              : $t('staking.unstakeValueTooltip')
          "
          width="40"
          textAlign="center"
          class="ml-2"
        />
      </template>
    </BalDataListRow>
    <BalDataListRow :label="$t('staking.newTotalShare')">
      <template #value>
        <span class="capitalize">
          {{ fNum2(sharePercentage, FNumFormats.percent) }}
        </span>
        <BalTooltip
          :text="$t('staking.totalShareTooltip')"
          width="40"
          textAlign="center"
          class="ml-2"
        />
      </template>
    </BalDataListRow>
  </BalDataList>
</template>
