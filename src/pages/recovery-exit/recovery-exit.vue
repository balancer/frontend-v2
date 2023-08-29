<script lang="ts" setup>
import WithdrawalsTable from './components/WithdrawalsTable.vue';
import TokenUnwrapTable from './components/TokenUnwrapTable.vue';
import UnstakeTable from './components/UnstakeTable.vue';

const unstakeEvents = ref(0);
const withdrawalEvents = ref(0);
</script>

<template>
  <div class="xl:container xl:px-4 pt-10 md:pt-12 xl:mx-auto">
    <div class="pb-4 content-container">
      <h2>Proportional exit</h2>
      <div class="text-primary text-md">
        <div>
          This tool was created to facilitate user exits from pools at risk to
          the vulnerability described
          <a
            href="https://forum.balancer.fi/t/vulnerability-found-in-some-pools/5102/1"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-500 underline"
            >here</a
          >. Many of these pools have been disabled to mitigate risk to user
          funds, so they will only support a basic type of exit. You may need to
          withdraw several times if you are a liquidity provider in a pool with
          nested pool tokens.
        </div>
        <ol class="pt-4 steps">
          <li>
            If your pool tokens are staked,
            <span class="font-bold">UNSTAKE</span> your pool tokens from the
            liquidity gauge. This tool supports unstaking from
            <span class="font-bold">Balancer</span> and
            <span class="font-bold">Aura</span>
            gauges.
          </li>
          <li>
            Exit the liquidity pool by clicking the
            <span class="font-bold">WITHDRAW</span> button. If the pool contains
            nested pool tokens you will need to
            <span class="font-bold">WITHDRAW</span> from the underlying pools as
            well.
          </li>
          <li>
            If you were deposited in a boosted pool, you will now have a wrapped
            version of your assets in your wallet. You need to
            <span class="font-bold">APPROVE</span> the token to be unwrapped,
            and then click <span class="font-bold">UNWRAP</span> to receive the
            underlying token.
          </li>
        </ol>
        <p>
          The general aim when using this tool is to keep unstaking, withdrawing
          and unwrapping until you have nothing left in any of the tables below.
        </p>
        <BalAlert type="warning" title="Check all networks" block
          >If you're invested in pools across several networks, select the
          appropriate network from the selector in the top right of the
          screen.</BalAlert
        >
      </div>
    </div>
    <UnstakeTable @unstaked="unstakeEvents++" />
    <WithdrawalsTable
      :unstakeEvents="unstakeEvents"
      class="mt-8"
      @withdrawal="withdrawalEvents++"
    />
    <TokenUnwrapTable :withdrawalEvents="withdrawalEvents" class="mt-8" />
  </div>
</template>

<style scoped>
.content-container :deep(h1) {
  @apply pb-6;
}

.content-container :deep(h2),
.content-container :deep(h3),
.content-container :deep(p),
.content-container :deep(ul),
.content-container :deep(ol),
.content-container :deep(em) {
  @apply pb-4;
}

.content-container :deep(h4),
.content-container :deep(h5),
.content-container :deep(h6) {
  @apply pb-2;
}

.content-container :deep(.subsection) {
  @apply mb-8;
}

.content-container :deep(h1),
.content-container :deep(h2),
.content-container :deep(h3),
.content-container :deep(h4) {
  @apply font-body tracking-tight;

  font-variation-settings: 'wght' 700;
}

.content-container :deep(h5) {
  @apply font-body tracking-tight;
}

.content-container :deep(li) {
  @apply list-disc ml-8 pb-2;
}

.content-container :deep(ol > li) {
  @apply list-decimal;
}

.content-container :deep(.nav li > ul) {
  padding-top: 0.375rem;
}

.content-container :deep(li > ul) {
  padding-top: 0;
  padding-bottom: 0;
}

.content-container :deep(.nav ul) {
  padding-bottom: 0;
}

.content-container :deep(li),
.content-container :deep(p) {
  @apply text-gray-700 dark:text-gray-300;
}

.content-container :deep(em) {
  font-style: italic;
  font-variation-settings: 'ital' 1;
  font-synthesis: none;
}

.content-container :deep(.link) {
  font-variation-settings: 'wght' 500;
}

.content-container :deep(em.font-medium) {
  font-variation-settings: 'ital' 1, 'wght' 500;
}

.content-container :deep(em.font-semibold) {
  font-variation-settings: 'ital' 1, 'wght' 600;
}
</style>
