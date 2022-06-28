<template>
  <BalModal
    :show="isVisible"
    @close="$emit('close')"
    title="Use of 3rd party services"
  >
    <p>
      {{ $t('policies.balancerThirdPartyInfo') }}
    </p>
    <br />
    <BalStack vertical class="pb-2">
      <span>
        {{ $t('policies.usesFollowing') }}
        {{ $t('policies.thirdPartyServices') }}:
      </span>
      <BalStack vertical class="pl-2">
        <BalStack
          spacing="base"
          horizontal
          v-for="service in services"
          :key="service"
          align="start"
        >
          <img
            height="36"
            :src="require(`@/assets/images/services/${service}.png`)"
            alt="Balancer 3rd party service"
          />
          <BalStack vertical spacing="none">
            <h6 class="capitalize">{{ service.replaceAll('-', ' ') }}</h6>
            <span>{{ $t(`services.${service}`) }}</span>
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

const services = [
  'infura',
  'alchemy',
  'the-graph',
  'google-analytics',
  'fathom-analytics',
  'TRM-labs',
  'sentry'
];
</script>
