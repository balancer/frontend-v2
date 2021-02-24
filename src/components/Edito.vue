<template>
  <div class="block-bg py-12 border-b">
    <Container class="relative">
      <div class="grid grid-cols-12 gap-8 flex items-center">
        <div class="col-span-12 md:col-span-6">
          <h1 v-text="$t('editoTitle')" class="text-3xl md:text-4xl mb-4" />
          <p v-text="$t('editoAbout')" class="mb-10 link-color" />
        </div>
        <div class="hidden md:block md:col-span-6">
          <img src="~@/assets/empty.png" class="border bg-color float-right" />
        </div>
      </div>
      <div class="absolute -bottom-4 text-2xl border-color">
        <span v-text="'•'" class="link-color mr-1" />
        <span v-text="'•'" class="mr-1" />
        <span v-text="'•'" class="mr-1" />
        <span v-text="'•'" class="mr-1" />
      </div>
    </Container>
  </div>
</template>
