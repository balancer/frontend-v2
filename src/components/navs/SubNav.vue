<template>
  <nav class="flex items-end border-b">
    <BalBtn
      v-if="isPoolPage"
      flat
      circle
      size="sm"
      color="gray"
      class="mb-3"
      @click="$router.push({ name: 'home' })"
    >
      <BalIcon name="arrow-left" size="sm" />
    </BalBtn>
    <BalTabs
      v-model="activeTab"
      :tabs="tabs"
      :no-pad="!isPoolPage"
      class="pt-4 -mb-px"
      @selected="onSelected"
    />
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'SubNav',

  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();

    const activeTab = ref('');

    const tabs = [
      { value: 'home', label: t('allPools') },
      { value: 'portfolio', label: t('portfolio') }
    ];

    const isPoolPage = computed(() => route.name === 'pool');

    function onSelected(tab) {
      router.push({ name: tab });
    }

    onBeforeMount(() => {
      if (route.name === 'home') {
        activeTab.value = 'home';
      } else if (route.name === 'portfolio') {
        activeTab.value = 'portfolio';
      }
    });

    return { tabs, activeTab, onSelected, isPoolPage };
  }
});
</script>
