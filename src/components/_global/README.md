# Balancer Components

A set of foundational components for use throughout the UI.

## Forms

Forms are difficult to demo via the storybook UI because they include stitching together a couple of different components plus validations. So instead here is a simple example of how a form can be used:

```vue
// ExampleUserForm.vue
<template>
  <BalForm ref="exampleUserForm" @on-submit="submit">
    <BalTextInput name="name" v-model="form.name" :rules="rules.name" />
    <BalTextInput name="email" v-model="form.email" :rules="rules.email" />
    <BalTextInput name="pass" v-model="form.pass" :rules="rules.pass" />
    <BalBtn type="submit" label="Submit" />
  </BalForm>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { isRequired, isEmail, minChar } from '@/lib/utils/validations';
import { FormRef } from '@/types';

export default defineComponent({
  name: 'exampleUserForm',

  setup() {
    const exampleUserForm = ref({} as FormRef);
    const form = reactive({
      name: '',
      email: '',
      pass: '',
    });
    const rules = {
      name: [isRequired()],
      email: [isRequired(), isEmail()],
      pass: [isRequired(), minChar(5)],
    };

    function submit() {
      if (exampleUserForm.value.validate()) {
        console.log('Valid form, do something with data:', form);
      } else {
        console.log('Invalid form');
      }
    }

    return { exampleUserForm, form, rules, submit };
  },
});
</script>
```
