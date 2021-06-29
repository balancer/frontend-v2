<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        :loading="web3Loading"
        :loading-label="upToLargeBreakpoint ? '' : $t('connecting')"
        color="gray"
        :outline="!upToLargeBreakpoint"
        rounded
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
      >
        <Avatar :address="account" :profile="profile" :size="avatarSize" />
        <span
          v-if="profile.ens"
          v-text="profile.ens"
          class="pl-2 hidden lg:inline-block"
        />
        <span
          v-else
          v-text="_shorten(account)"
          class="pl-2 hidden lg:inline-block eth-address"
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
import { computed, defineComponent } from 'vue';
import useWeb3 from '@/composables/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import AppNavSettings from './AppNavSettings.vue';
import Avatar from '@/components/images/Avatar.vue';

export default defineComponent({
  name: 'AppNavAccountBtn',

  components: {
    AppNavSettings,
    Avatar
  },

  setup() {
    const { bp, upToLargeBreakpoint } = useBreakpoints();
    const { account, profile, loading: web3Loading } = useWeb3();

    const avatarSize = computed(() => {
      if (bp.value === 'sm') {
        return 35;
      } else if (['md', 'lg'].includes(bp.value)) {
        return 40;
      } else {
        return 20;
      }
    });

    return {
      bp,
      account,
      profile,
      web3Loading,
      avatarSize,
      upToLargeBreakpoint
    };
  }
});
</script>
