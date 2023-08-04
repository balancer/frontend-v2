<script setup lang="ts">
import { Pool } from '@/services/pool/types';

type Props = {
  pool: Pool;
  defaultPoolActions: string[];
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
const isSelectorOpened = ref(false);

function handleClickOutside() {
  isSelectorOpened.value = false;
  console.log('clicked');
}
function getActionIcon(action: string) {
  return new URL(
    `/src/assets/images/icons/pool-actions/${action}.svg`,
    import.meta.url
  ).href;
}

const menuItems = computed(() => {
  const items = [...props.defaultPoolActions];
  if (props.showMigrateGaugeAction) {
    items.unshift('migrateGauge');
  } else if (props.showPokeAction) {
    items.unshift('poke');
  }

  return items;
});
</script>

<template>
  <div
    v-if="menuItems"
    v-click-outside="handleClickOutside"
    class="flex relative justify-center py-4 px-2"
  >
    <div
      class="flex justify-center items-center w-7 h-7 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-600 transition-all duration-200 text-[8px]"
      @click.stop="isSelectorOpened = !isSelectorOpened"
    >
      &bull;&bull;&bull;
    </div>
    <ul
      v-if="isSelectorOpened"
      class="absolute z-10 bg-white rounded border border-gray-200 shadow right-[60px] top-[50px] radius-md"
    >
      <li
        v-for="action in menuItems"
        :key="action"
        class="flex items-center py-3 pr-10 pl-3 font-medium text-left whitespace-pre hover:bg-gray-100 cursor-pointer"
        :class="{
          'bg-red-50 border-b border-gray-200':
            action === 'poke' || action === 'migrateGauge',
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
    </ul>
  </div>
</template>

