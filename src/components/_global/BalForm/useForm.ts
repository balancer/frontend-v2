import { reactive } from 'vue';

type UseFormRequest = {
  name: string;
};

type FormState = {
  name: string;
  inputs: Record<
    string,
    {
      value: any;
      changeHandler: (value: any) => void;
    }
  >;
};

export default function useForm({ name }: UseFormRequest) {
  /**
   * STATE
   */
  const formState = reactive<FormState>({ name, inputs: {} });

  if (!name) {
    throw new Error(
      `Failed to create a form instance. No form name was provided.`
    );
  }

  function register(names: string | string[], defaultValue?: any | any[]) {
    // this will be passed to the input components via v-bind
    // it will assign the v-model handlers
    const binder: any = {};
    if (Array.isArray(names)) {
      for (const name of names) {
        if (!formState.inputs[name]) {
          formState.inputs[name] = {
            value: defaultValue ?? '',
            changeHandler: function(value: any) {
              console.log('eshayz', value);
              formState.inputs[name].value = value;
            }
          };
        }
        binder[name] = formState.inputs[name].value;
        binder[`v-mydirective:[@update:${name}]`] =
          formState.inputs[name].changeHandler;
      }
    } else {
      if (!formState.inputs[names]) {
        formState.inputs[name] = {
          value: defaultValue ?? '',
          changeHandler: function(value: any) {
            console.log('eshayz', value);
            formState.inputs[name].value = value;
          }
        };
      }
      binder[name] = formState.inputs[name].value;
      binder[`v-mydirective:[@update:${name}]`] = formState.inputs[name].changeHandler;
    }
    return binder;
  }

  return {
    register
  };
}
