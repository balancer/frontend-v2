<script setup lang="ts">
</script>

<template>
  <p>
    This page is rendered on the <b>client-side only</b> (the server-side only
    renders an HTML skeleton). This technique is sometimes referred to as
    <b>client-side rendering</b> (CSR), but
    <InlineCode>vite-plugin-ssr</InlineCode> refers to it as
    <a href="https://vite-plugin-ssr.com/render-modes#spa"
      ><b>single page app</b> (SPA)</a
    >
    rendering.
  </p>
  <p>
    It is enabled in <InlineCode>vite-plugin-ssr</InlineCode> by changing the
    filename for your page to <InlineCode>[name].page.client.xyz</InlineCode>,
    which causes <InlineCode>pageContext.Page</InlineCode> to only be defined on
    the client-side. (You must handle this properly in your
    <InlineCode>_default</InlineCode> page files.)
  </p>
  <Counter />
</template>
