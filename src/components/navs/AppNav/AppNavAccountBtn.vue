<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        class="text-base"
        :loading="isLoadingWallet"
        :loading-label="['sm', 'md', 'lg'].includes(bp) ? '' : $t('connecting')"
        color="gray"
        outline
        rounded
        :size="['sm', 'md', 'lg'].includes(bp) ? 'md' : 'sm'"
        :circle="['sm', 'md', 'lg'].includes(bp)"
      >
        <Avatar :address="account" :profile="profile" size="20" />
        <span
          v-if="bProfile?.name || bProfile?.ens"
          v-text="bProfile?.name || bProfile?.ens"
          class="pl-2 hidden lg:inline-block"
        />
        <span
          v-else
          v-text="_shorten(bAccount.address.value)"
          class="pl-2 hidden lg:inline-block address"
        />
        <BalIcon
          name="chevron-down"
          size="sm"
          class="pl-1 hidden lg:inline-block"
        />
      </BalBtn>
    </template>
    <AppNavSettings v-if="!web3Loading" />
  </BalPopover>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useWeb3 from '@/composables/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import AppNavSettings from './AppNavSettings.vue';
import Avatar from '@/components/images/Avatar.vue';
import useBlocknative from '@/composables/useBlocknative';

export default defineComponent({
  name: 'AppNavAccountBtn',

  components: {
    AppNavSettings,
    Avatar
  },

  setup() {
    const { bp } = useBreakpoints();
    const { account, profile, loading: web3Loading } = useWeb3();
    const {
      account: bAccount,
      profile: bProfile,
      isLoadingWallet
    } = useBlocknative();

    return {
      bp,
      account,
      profile,
      web3Loading,
      bAccount,
      bProfile,
      isLoadingWallet
    };
  }
});
</script>

<style scoped>
.address {
  font-variant-ligatures: no-contextual;
}
</style>
