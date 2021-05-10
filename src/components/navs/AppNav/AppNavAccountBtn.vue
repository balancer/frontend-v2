<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        class="text-base"
        :loading="web3Loading"
        :loading-label="['sm', 'md', 'lg'].includes(bp) ? '' : $t('connecting')"
        color="gray"
        outline
        rounded
        :size="['sm', 'md', 'lg'].includes(bp) ? 'md' : 'sm'"
        :circle="['sm', 'md', 'lg'].includes(bp)"
      >
        <Avatar :address="account" :profile="profile" size="20" />
        <span
          v-if="profile.name || profile.ens"
          v-text="profile.name || profile.ens"
          class="pl-2 hidden lg:inline-block"
        />
        <span
          v-else
          v-text="_shorten(account)"
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

export default defineComponent({
  name: 'AppNavAccountBtn',

  components: {
    AppNavSettings
  },

  setup() {
    const { bp } = useBreakpoints();
    const { account, profile, loading: web3Loading } = useWeb3();

    return {
      bp,
      account,
      profile,
      web3Loading
    };
  }
});
</script>

<style scoped>
.address {
  font-variant-ligatures: no-contextual;
}
</style>
