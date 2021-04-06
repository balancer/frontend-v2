<template>
  <div id="app" class="overflow-x-hidden lg:overflow-x-visible">
    <UiLoading v-if="app.loading || !app.init" />
    <div v-else>
      <Topnav />
      <div class="pb-12">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <div id="modal" />
    <AccountModal
      :open="web3.modal"
      @close="setAccountModal(false)"
      @login="onLogin"
    />
    <Notifications />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import useWeb3Watchers from '@/composables/useWeb3Watchers';
import AccountModal from '@/components/modals/AccountModal.vue';

export default defineComponent({
  components: {
    AccountModal
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    useWeb3Watchers();

    // CALLBACKS
    onBeforeMount(() => {
      store.dispatch('init');
    });

    // METHODS
    async function onLogin(connector: string): Promise<void> {
      store.commit('setAccountModal', false);
      await store.dispatch('login', connector);
    }

    return {
      onLogin
    };
  }
});
</script>
