import { Rules } from '@/types';
import { onBeforeMount, provide, reactive, ref, toRefs, watch } from 'vue';

type UseFormRequest = {
  name: string;
};

type FormInstance = {
  name: string;
  values: Record<string, any>;
  errors: Record<string, string[]>;
  rules: Record<string, Rules | undefined>;
};

export const FormContextSymbol = Symbol('FORM_CONTEXT');

const formInstance = reactive<FormInstance>({
  name: '',
  values: {},
  errors: {},
  rules: {}
});

export default function useForm({ name }: UseFormRequest) {
  onBeforeMount(() => {
    if (!name) {
      throw new Error(
        `Failed to create a form instance. No form name was provided.`
      );
    }
    formInstance.name = name;
  });

  /**
   * STATE
   */

  /**
   * METHODS
   */
  function register(name: string, rules?: Rules) {
    if (!formInstance.values[name]) {
      formInstance.values[name] = '';
    }
    if (!formInstance.rules[name] && rules?.length) {
      formInstance.rules[name] = rules;
    }
    return formInstance.values[name];
  }

  function onChange(name: string, value: any) {
    if (formInstance.values[name] === undefined) {
      throw new Error(
        `[${name}] is not a registered input for form [${formInstance.name}]`
      );
    }
    formInstance.values[name] = value;
    const rules = formInstance.rules[name];
    if (rules?.length) {
      const failedRules = rules
        .map(rule => {
          const pass = rule(formInstance.values[name]);
          if (typeof pass === 'string') {
            return pass;
          }
        })
        .filter(result => result !== undefined);
      formInstance.errors[name] = failedRules as string[];
    }
  }

  watch(
    () => formInstance.values,
    () => {
      console.log('f', formInstance.values);
    }
  );

  provide(FormContextSymbol, { ...toRefs(formInstance), register, onChange });

  return {
    ...toRefs(formInstance)
  };
}
