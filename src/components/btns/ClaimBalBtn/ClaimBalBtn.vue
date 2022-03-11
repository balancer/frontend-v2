<script lang="ts" setup>
import { computed } from 'vue';
import { balancerMinter } from '@/services/balancer/contracts/contracts/balancer-minter';
import { Gauge } from '@/services/balancer/gauges/types';
import { getAddress } from '@ethersproject/address';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import useGaugesDecorationQuery from '@/composables/queries/useGaugesDecorationQuery';
import { useI18n } from 'vue-i18n';
import TxActionBtn from '@/components/btns/TxActionBtn/TxActionBtn.vue';

/**
 * TYPES
 */
type Props = {
  gauges: Gauge[];
  label: string;
  amount: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum2 } = useNumbers();
const { data: subgraphGauges } = useGaugesQuery();
const gaugesQuery = useGaugesDecorationQuery(subgraphGauges);

/**
 * COMPUTED
 */
const gaugeAddresses = computed((): string[] =>
  props.gauges.map(gauge => getAddress(gauge.id))
);

/**
 * METHODS
 */
async function claimTx() {
  if (props.gauges.length === 1) {
    return await balancerMinter.mint(gaugeAddresses.value[0]);
  } else {
    return await balancerMinter.mintMany(gaugeAddresses.value);
  }
}
</script>

<template>
  <TxActionBtn
    :label="label"
    color="gradient"
    size="sm"
    :actionFn="claimTx"
    :onConfirmFn="gaugesQuery.refetch.value"
    action="claim"
    :summary="`${t('claim')} ${fNum2(props.amount, FNumFormats.token)} BAL`"
    :confirmingLabel="$t('claiming')"
  />
</template>
