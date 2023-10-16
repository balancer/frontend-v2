<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import { onClickOutside } from '@vueuse/core';
import { PoolAction } from '@/components/contextual/pages/pools/types';
import {
  deprecatedDetails,
  isJoinsDisabled,
} from '@/composables/usePoolHelpers';
import { PoolWarning } from '@/types/pools';
import { usePoolWarning } from '@/composables/usePoolWarning';
import { useDisabledJoinPool } from '@/composables/useDisabledJoinPool';
import { POOLS } from '@/constants/pools';

type Props = {
  pool: Pool;
  defaultPoolActions: PoolAction[];
  showPokeAction?: boolean;
  showMigrateGaugeAction?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  showPokeAction: false,
  showMigrateGaugeAction: false,
});
defineEmits<{
  (e: 'click:add', value: Pool): void;
  (e: 'click:remove', value: Pool): void;
  (e: 'click:unstake', value: Pool): void;
  (e: 'click:vote', value: Pool): void;
  (e: 'click:poke', value: Pool): void;
  (e: 'click:migrateGauge', value: Pool): void;
}>();

const { isAffectedBy } = usePoolWarning(computed(() => props.pool.id));
const { shouldDisableJoins } = useDisabledJoinPool(props.pool);

const isSelectorOpened = ref(false);

function handleClickOutside() {
  isSelectorOpened.value = false;
}
function getActionIcon(action: string) {
  return new URL(
    `/src/assets/images/icons/pool-actions/${action}.svg`,
    import.meta.url
  ).href;
}

function isActionDisabled(action: PoolAction) {
  const isDeprecated =
    Boolean(deprecatedDetails(props.pool.id)) ||
    isAffectedBy(PoolWarning.PoolProtocolFeeVulnWarning) ||
    isJoinsDisabled(props.pool.id) ||
    shouldDisableJoins.value ||
    POOLS.BrandedRedirect?.[props.pool.poolType];

  const actionsToDisable = [
    PoolAction.Add,
    PoolAction.Stake,
    PoolAction.MigrateGauge,
  ];

  const isStakablePool =
    POOLS.Stakable.VotingGaugePools.includes(props.pool.id) ||
    POOLS.Stakable.AllowList.includes(props.pool.id);

  return (
    (isDeprecated && actionsToDisable.includes(action)) ||
    (!isStakablePool && action === PoolAction.Stake)
  );
}

const menuItems = computed(() => {
  const items = [...props.defaultPoolActions];
  if (props.showMigrateGaugeAction) {
    items.unshift(PoolAction.MigrateGauge);
  } else if (props.showPokeAction) {
    items.unshift(PoolAction.Poke);
  }

  return items;
});

const showActionCall = computed(() => {
  return menuItems.value.some(
    action => action === 'migrateGauge' || action === 'poke'
  );
});

const clickOutsideTarget = ref(null);

onClickOutside(clickOutsideTarget, handleClickOutside);
</script>

<template>
  <div
    v-if="menuItems"
    ref="clickOutsideTarget"
    class="flex relative justify-end py-4 pr-8"
  >
    <div
      class="flex relative justify-center items-center w-7 h-7 text-blue-600 hover:bg-blue-50 rounded-md border-2 border-blue-600 transition-all duration-200 text-[8px]"
      @click.stop="isSelectorOpened = !isSelectorOpened"
    >
      <div
        v-if="showActionCall"
        class="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white right-[-4px] top-[-4px]"
      />
      &bull;&bull;&bull;
    </div>
    <ul
      v-if="isSelectorOpened"
      class="absolute z-10 bg-white dark:bg-gray-700 rounded border border-gray-200 shadow right-[60px] top-[50px] radius-md"
    >
      <template v-for="action in menuItems" :key="action">
        <li
          v-if="!isActionDisabled(action)"
          class="flex items-center py-3 pr-10 pl-3 font-medium text-left dark:hover:text-gray-600 whitespace-pre hover:bg-gray-100 first:rounded-t cursor-pointer radius-md"
          :class="{
            'bg-red-50 hover:bg-red-100 dark:bg-red-300 border-b border-gray-200':
              action === PoolAction.Poke || action === PoolAction.MigrateGauge,
          }"
          @click.stop="$emit(`click:${action}`, pool)"
        >
          <img
            :src="getActionIcon(action)"
            alt=""
            class="p-0.5 rounded-full w-[20px]"
          />
          <div class="pr-5 pl-2">{{ $t(`poolActions.${action}`) }}</div>
        </li>
      </template>
    </ul>
  </div>
</template>

