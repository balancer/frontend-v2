<template>
  <div class="block-bg py-12 border-b bg-white">
    <Container class="relative">
      <div class="grid grid-cols-12 gap-8 flex items-center">
        <div class="col-span-12 md:col-span-6">
          <h1 v-text="$t('editoTitle')" class="mb-4" />
          <p v-text="$t('editoAbout')" class="mb-10" />
        </div>
        <div class="hidden md:block md:col-span-6">
          <img src="~@/assets/empty.png" class="bg-gray-100 border border-gray-100 float-right" />
        </div>
      </div>
      <div class="hidden absolute -bottom-4 text-2xl border-color">
        <span v-text="'•'" class="link-color mr-1" />
        <span v-text="'•'" class="mr-1" />
        <span v-text="'•'" class="mr-1" />
        <span v-text="'•'" class="mr-1" />
      </div>
    </Container>
  </div>
</template>
