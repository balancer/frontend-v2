<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        class="text-base"
        :class="{ btn: upToLargeBreakpoint }"
        :loading="web3Loading"
        :loading-label="upToLargeBreakpoint ? '' : $t('connecting')"
        color="gray"
        :outline="!upToLargeBreakpoint"
        rounded
        flat
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
      >
        <Avatar :address="account" :profile="profile" :size="avatarSize" />
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

<style scoped>
.address {
  font-variant-ligatures: no-contextual;
}
.btn {
  @apply bg-transparent;
}
.btn:hover {
  @apply bg-transparent;
}
</style>
