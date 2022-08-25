<template>
  <BalModal
    :show="isVisible"
    title="Use of 3rd party services"
    class="third-parties"
    @close="emit('close')"
  >
    <p class="pb-3 text-sm">{{ $t('policies.balancerThirdPartyInfo') }}.</p>
    <BalStack vertical class="pb-2">
      <span class="text-sm font-medium">
        {{ $t('policies.usesFollowing') }}
        {{ $t('policies.thirdPartyServices') }}:
      </span>
      <BalStack vertical class="pl-2">
        <BalStack
          v-for="service in services"
          :key="service"
          spacing="base"
          horizontal
          align="start"
        >
          <img
            width="36"
            height="36"
            :src="require(`@/assets/images/services/${service}.svg`)"
            alt="Balancer 3rd party service"
            class="mt-1"
          />
          <BalStack vertical spacing="none">
            <h6 class="capitalize">
              {{ service.replaceAll('-', ' ') }}
            </h6>
            <span class="text-sm">{{ $t(`services.${service}`) }}</span>
          </BalStack>
        </BalStack>
      </BalStack>
    </BalStack>
  </BalModal>
</template>

<script setup lang="ts">
type Props = {
  isVisible: boolean;
};

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const services = [
  'infura',
  'alchemy',
  'the-graph',
  'fathom-analytics',
  'TRM-labs',
  'sentry',
];
</script>
<style scoped>
/* If this modal is placed on top of the Connect Wallet modal */
.bal-modal + .bal-modal.third-parties :deep(.modal-bg) {
  @apply bg-opacity-0;
}
</style>
