<template>
  <BalAlert
    type="warning"
    title="Resubmit your votes to use your full voting power"
    contentClass="w-full"
  >
    <div class="flex flex-col sm:flex-row gap-4 justify-between">
      <div class="mr-auto max-w-3xl">
        Votes on pools are set at the time of the vote. Since you’ve added new
        veBAL since your original vote, you have additional voting power which
        is not being used. To use your full voting power, resubmit your votes.
      </div>

      <BalBtn color="gradient" class="flex-shrink-0">Resubmit my votes</BalBtn>
    </div>
  </BalAlert>
</template>

<script setup lang="ts">

</script>


