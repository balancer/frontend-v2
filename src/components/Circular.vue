<template>
  <Pie :data="names" />
</template>

<script>
import { take } from 'lodash';

const NAMES = [
  { name: 'BAL', value: 80 },
  { name: 'WETH', value: 20 }
];

export default {
  data() {
    return {
      names: take(NAMES, 3)
    };
  }
};
</script>
