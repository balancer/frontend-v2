<script setup lang="ts">
const emit = defineEmits(['close']);

const weightedIconSrc = new URL(
  '@/assets/images/icons/pool-weighted.png',
  import.meta.url
).href;
const stableIconSrc = new URL(
  '@/assets/images/icons/pool-stable.png',
  import.meta.url
).href;
</script>

<template>
  <BalModal show @close="emit('close')">
    <template #header>
      <h3>Choose pool type</h3>
    </template>
    <div class="flex flex-col space-y-4">
      <BalCard
        class="group hover:shadow-xl transition-all hover:cursor-pointer"
        @click="emit('close')"
      >
        <div class="flex items-center space-x-4">
          <img
            :src="weightedIconSrc"
            alt="Weighted pool icon"
            width="100"
            height="100"
          />
          <div>
            <h3
              class="text-lg font-semibold group-hover:text-blue-500 transition-all"
            >
              Weighted pool
            </h3>
            <p class="text-sm text-gray-500">
              Best for uncorrelated assets, e.g. WETH/WBTC.
            </p>
          </div>
        </div>
      </BalCard>
      <a
        href="https://k0gwxqsj545.typeform.com/to/FGbUIJdi"
        target="_blank"
        rel="noopener noreferrer"
      >
        <BalCard
          class="group hover:shadow-xl transition-all hover:cursor-pointer"
        >
          <div class="flex items-center space-x-4">
            <img
              :src="stableIconSrc"
              alt="Weighted pool icon"
              width="100"
              height="100"
            />
            <div>
              <div class="flex items-center space-x-2">
                <h3
                  class="text-lg font-semibold group-hover:text-blue-500 transition-all"
                >
                  Stable pool
                </h3>
                <BalIcon
                  name="arrow-up-right"
                  size="sm"
                  class="text-gray-500 group-hover:text-blue-500 transition-all"
                />
              </div>
              <p class="text-sm text-gray-500">
                Best for correlated assets, e.g. wstETH/WETH.
              </p>
            </div>
          </div>
        </BalCard>
      </a>
    </div>
    <template #footer
      ><p class="text-sm text-gray-500">
        <BalLink href="https://docs.balancer.fi/concepts/pools/" external
          >View the developer docs</BalLink
        >
        to create other pool types.
      </p></template
    >
  </BalModal>
</template>
