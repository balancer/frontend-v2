<script setup lang="ts"></script>

<template>
  <div class="flex justify-center mb-8 ml-4 lg:ml-0">
    <div class="flex flex-col w-full max-w-3xl mt-auto mb-2">
      <h2 class="text-green-500">
        Maximize your Yield
      </h2>
      <h2 class="text-lg font-light mb-4">
        Stake your Fidelio Duetto BPTs for fBEETS
      </h2>
      <p>
        30% of Beethoven X protocol revenue is used to reward fBEETS holders.
        When you stake your Fidelio Duetto BPTs, you receive fBEETS in return.
        fBEETS holders earn triple yield:
      </p>
      <ol class="list-decimal list-inside ml-2 mt-2">
        <li>Swap fees earned as a Liquidity Provider (LP)</li>
        <li>Farm incentives</li>
        <li>30% of Protocol Revenue</li>
      </ol>
      <!--        <BalLoadingBlock v-if="false" class="h-10 w-40" />-->
    </div>
    <div class="hidden pl-8 ml-6 md:block">
      <img
        src="~@/beethovenx/assets/images/BEETX-fBEET-3D2x.png"
        style="width: 256px; max-width: 256px;"
      />
    </div>
  </div>
</template>
