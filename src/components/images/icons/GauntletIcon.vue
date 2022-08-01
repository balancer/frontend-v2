<template>
  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fill-rule="evenodd">
      <circle fill="#192533" cx="10" cy="10" r="10" />
      <g fill-rule="nonzero">
        <path
          d="M11.608 12.19v-2.095H9.453V8h4.31v4.19h-2.155zm2.155-6.285H7.298v6.285H5.143V3.81h8.62v2.095z"
          fill="#87ABC5"
        />
        <path
          fill="#87ABC5"
          d="M13.763 13.029v1.257H7.298V12.19h4.31v-.942h2.155z"
        />
        <path fill="#FFF" d="M15.918 5.905V8h-2.155V5.905z" />
        <path fill="#1D252E" d="M7.298 12.19v2.096H5.143V12.19z" />
        <path fill="#F07F53" d="M7.298 14.286v2.095H5.143v-2.095z" />
      </g>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GauntletIcon',
});
</script>
