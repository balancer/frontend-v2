import { onBeforeMount, provide, reactive, ref, toRefs, watch } from 'vue';

type UseFormRequest = {
  name: string;
};

type FormInstance = {
  name: string;
  values: Record<string, any>;
};

export const FormContextSymbol = Symbol('FORM_CONTEXT');

const formInstance = reactive<FormInstance>({ name: '', values: {} });

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
  function register(name: string) {
    if (!formInstance.values[name]) {
      formInstance.values[name] = '';
    }
    console.log('lol', formInstance.values[name]);
    return formInstance.values[name];
  }

  function onChange(name: string, value: any) {
    console.log('formIns', formInstance.values)
    if (formInstance.values[name] === undefined) {
      throw new Error(
        `[${name}] is not a registered input for form [${formInstance.name}]`
      );
    }
    console.log('linglong', name, value)
    formInstance.values[name] = value;
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
