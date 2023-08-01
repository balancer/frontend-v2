<script setup lang="ts">
type Props = {
  menuItems?: string[];
};

defineProps<Props>();
defineEmits<{
  (e: 'choose-action', value: string): void;
}>();
const isSelectorOpened = ref(false);
</script>

<template>
  <div v-if="menuItems" class="flex relative justify-center py-4 px-2">
    <div
      class="flex justify-center items-center w-7 h-7 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-600 transition-all duration-200 text-[8px]"
      @click.stop="isSelectorOpened = !isSelectorOpened"
    >
      &bull;&bull;&bull;
    </div>
    <ul
      v-if="isSelectorOpened"
      class="absolute z-10 bg-white rounded border border-gray-200 shadow right-[60px] top-[50px] radius-md"
    >
      <!-- Add your menu items here -->
      <li
        v-for="item in menuItems"
        :key="item"
        class="py-3 text-left whitespace-pre hover:bg-gray-100 cursor-pointer"
        @click.stop.prevent="$emit('choose-action', item)"
      >
        <div class="pr-5 pl-2">{{ $t(`poolActions.${item}`) }}</div>
      </li>
    </ul>
  </div>
</template>