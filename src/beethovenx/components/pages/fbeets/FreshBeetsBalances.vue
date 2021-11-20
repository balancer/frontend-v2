<script setup lang="ts">
type Props = {
  loading: boolean;
  fBeetsBalance: string;
  bptBalance: string;
  beetsBalance: string;
};

const props = defineProps<Props>();

/**
 * STATE
 */
</script>

<template>
  <BalCard shadow="xl" class="mb-4 pb-1">
    <div class="flex flex-col flex-grow md:mb-10">
      <h4 class="mb-3">My Balance</h4>
      <div class="flex items-center space-x-4">
        <img src="~@/beethovenx/assets/images/fBEETS.png" width="64" />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ props.fBeetsBalance }}
          </p>
          <p class="text-sm md:text-base text-primary">fBEETS</p>
        </div>
      </div>
    </div>
    <div class="flex flex-col flex-grow md:mb-10">
      <h4 class="mb-3">My Unstaked BPTs</h4>
      <div class="flex items-center space-x-4">
        <img
          src="~@/beethovenx/assets/images/fidellio-duetto-bpt.png"
          width="64"
        />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ props.bptBalance }}
          </p>
          <p class="text-sm md:text-base text-primary">
            Fidelio Duetto BPTs
          </p>
        </div>
      </div>
    </div>
    <div class="flex flex-col flex-grow">
      <h4 class="mb-3">My Uninvested BEETS</h4>
      <div class="flex items-center space-x-4">
        <img
          src="~@/beethovenx/assets/images/beets-icon-large.png"
          width="64"
        />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ props.beetsBalance }}
          </p>
          <p class="text-sm md:text-base text-primary">
            BEETS
          </p>
        </div>
      </div>
    </div>
  </BalCard>
</template>
