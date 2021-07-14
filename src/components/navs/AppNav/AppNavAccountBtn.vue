<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        class="text-base"
        :class="{ btn: upToLargeBreakpoint }"
        :loading="isLoadingProfile"
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
    <AppNavSettings />
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppNavSettings from './AppNavSettings.vue';
import Avatar from '@/components/images/Avatar.vue';
import useVueWeb3 from '@/services/web3/useVueWeb3';

export default defineComponent({
  name: 'AppNavAccountBtn',

  components: {
    AppNavSettings,
    Avatar
  },

  setup() {
    const { bp, upToLargeBreakpoint } = useBreakpoints();
    const { isLoadingProfile, profile, account } = useVueWeb3();

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
      // computed
      bp,
      account,
      profile,
      avatarSize,
      upToLargeBreakpoint,
      isLoadingProfile
    };
  }
});
</script>
