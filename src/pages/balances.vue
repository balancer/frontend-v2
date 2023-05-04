<script setup lang="ts">
import InternalBalancesTable from '@/components/tables/InternalBalancesTable.vue';
</script>

<template>
  <div class="xl:container xl:px-4 pt-10 md:pt-12 xl:mx-auto">
    <BalStack vertical>
      <div class="px-4 xl:px-0">
        <BalStack horizontal justify="between" align="center">
          <h3>{{ $t('pages.balances.title') }}</h3>
        </BalStack>
      </div>
      <BalStack vertical spacing="2xl">
        <InternalBalancesTable />
      </BalStack>
      <p class="px-4 lg:px-0 mt-4 max-w-3xl text-sm text-gray-500">
        {{ $t('pages.balances.eulerHack') }}
        <BalLink href="https://redemptions.euler.finance/" external
          >https://redemptions.euler.finance/</BalLink
        >
      </p>
    </BalStack>
  </div>
</template>
