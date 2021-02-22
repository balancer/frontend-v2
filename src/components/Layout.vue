<template>
  <Container :slim="true">
    <div class="grid grid-cols-12 gap-5">
      <slot />
      <div v-if="$slots['sidebar-left']" class="col-span-12 md:col-span-3">
        <slot name="sidebar-left" />
      </div>
      <div v-if="$slots['content-right']" class="col-span-12 md:col-span-9">
        <slot name="content-right" />
      </div>
      <div v-if="$slots['content-left']" class="col-span-12 md:col-span-8">
        <slot name="content-left" />
      </div>
      <div v-if="$slots['sidebar-right']" class="col-span-12 md:col-span-4">
        <slot name="sidebar-right" />
      </div>
    </div>
  </Container>
</template>
