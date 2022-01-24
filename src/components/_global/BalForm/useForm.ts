import { Rules } from '@/types';
import {
  onBeforeMount,
  provide,
  reactive,
  ref,
  toRefs,
  watch,
  ToRefs
} from 'vue';

type UseFormRequest = {
  name: string;
};

export type FormState = {
  name: string;
  values: Record<string, any>;
  errors: Record<string, string[]>;
  rules: Record<string, Rules | undefined>;
};

export type FormInstance = ToRefs<FormState> & {
  register: (name: string, rules?: Rules) => any;
  onChange: (name: string, value: any) => void;
};

export const FormContextSymbol = Symbol('FORM_CONTEXT');

export default function useForm({
  name: formName
}: UseFormRequest): FormInstance {
  onBeforeMount(() => {
    if (!formName) {
      throw new Error(
        `Failed to create a form instance. No form name was provided.`
      );
    }
    formInstance.name = formName;
  });

  /**
   * STATE
   */
  // each useForm call spawns its own instance to support
  // the usage of multiple forms on the same page
  const formInstance = reactive<FormState>({
    name: '',
    values: {},
    errors: {},
    rules: {}
  });

  /**
   * METHODS
   */
  // this method is used to pass in a form value to a field
  // make sure it is passed to the :value prop or an equivalent
  // as it is bound only one way (read only)
  function register(name: string, rules?: Rules) {
    // invalid name
    if (name === '') {
      throw new Error(
        `Failed to register input for form [${formName}], name was empty string.`
      );
    }
    // if the field isn't registered yet set it up with an empty value
    if (!formInstance.values[name]) {
      formInstance.values[name] = '';
    }
    // register any rules the field has
    if (!formInstance.rules[name] && rules?.length) {
      formInstance.rules[name] = rules;
    }
    // return the value
    return formInstance.values[name];
  }

  // call this function to update bound form values
  function onChange(name: string, value: any) {
    if (formInstance.values[name] === undefined) {
      throw new Error(
        `[${name}] is not a registered input for form [${formInstance.name}]`
      );
    }
    formInstance.values[name] = value;

    // validate against any rules that might be registered
    // for this form field
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

  return {
    ...toRefs(formInstance),
    register,
    onChange
  };
}
